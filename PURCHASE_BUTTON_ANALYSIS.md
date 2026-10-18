# Purchase Wizard Button Analysis - Issues Found

## Issue Summary

The "Create and charge" button doesn't properly validate `availableQty` before enabling, and the backend doesn't validate quantity availability either.

---

## FRONTEND ISSUES (PurchaseWizardDialog.vue)

### Issue 1: Missing availableQty Validation in `canSubmit`

**Location:** [app/components/organisation-products/PurchaseWizardDialog.vue](app/components/organisation-products/PurchaseWizardDialog.vue#L345-L351)

```typescript
const canSubmit = computed(
    () =>
        Boolean(destinationLocationId.value) &&
        selectedVariantIds.value.size > 0 &&
        (isInternal.value || Boolean(activeCreditCard.value))
)
```

**Problem:** The button is enabled based on:

- ✅ Destination location selected
- ✅ At least one variant selected
- ✅ Either internal OR active credit card exists

**Missing Validation:**

- ❌ Does NOT check if all selected quantities are within available bounds
- ❌ Does NOT check if any quantity is invalid (0 or negative)
- ❌ Does NOT check if availableQty changed after selection

### Issue 2: Variant Checkbox Only Controls Selection, Not Quantity

**Location:** [app/components/organisation-products/PurchaseWizardDialog.vue](app/components/organisation-products/PurchaseWizardDialog.vue#L121-L127)

```vue
<v-checkbox
    :model-value="selectedVariantIds.has(item.variantId)"
    hide-details
    :disabled="item.availableQty <= 0"  <!-- Only disables if 0 -->
    @update:model-value="
        toggleVariant(item.variantId, Boolean($event))
    "
/>
```

**Problem:**

- Checkbox disabled only when `availableQty <= 0`
- But variant CAN be selected, then availableQty drops to 0 before submission
- Race condition: If platform sells the last bottle between when user selects and submits

### Issue 3: Quantity Field Auto-Clamps But No Submit Validation

**Location:** [app/components/organisation-products/PurchaseWizardDialog.vue](app/components/organisation-products/PurchaseWizardDialog.vue#L369-L377)

```typescript
function setQuantity(variantId: number, maximum: number, value: unknown): void {
    const parsed = Math.trunc(Number(value))
    quantities.value = {
        ...quantities.value,
        [variantId]: Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : 1,
    }
}
```

**Good:** Quantity is clamped to max when user types
**Problem:** But if `maximum` (availableQty) is stale from backend, clamping is wrong
**Problem:** No validation in `canSubmit` to verify all quantities are still valid

### Issue 4: availableQty Calculation is Global (All Locations)

**Location:** [src/modules/e-commerce/organisation-products/organisation-product.mapper.ts](src/modules/e-commerce/organisation-products/organisation-product.mapper.ts#L75)

```typescript
const qty = balances.reduce((total, balance) => total + balance.onHand, 0) // All locations
const reservedQty = balances.reduce((total, balance) => total + balance.reserved, 0) // All locations
const availableQty = qty - reservedQty // TOTAL across all locations
```

**Problem:**

- availableQty = sum across ALL organisation locations
- But user is buying for a SPECIFIC location (destinationLocationId)
- Should validate against inventory at that specific location only!
- Example: If availableQty = 50 (across 5 locations with 10 each), but selected location has only 0, system still allows purchase

---

## BACKEND ISSUES (organisation-product-purchase.service.ts)

### Issue 5: `resolveItems()` Doesn't Validate Quantity Availability

**Location:** [src/modules/e-commerce/organisation-product-purchase/organisation-product-purchase.service.ts](src/modules/e-commerce/organisation-product-purchase/organisation-product-purchase.service.ts#L383)

```typescript
private async resolveItems(
    organisationId: number,
    command: CreateProcurementOrderCommand
): Promise<ResolvedProcurementItem[]> {
    const resolved: ResolvedProcurementItem[] = [];
    for (const item of command.items) {
        // Validates location exists and belongs to organisation
        const location = await this.locationRepository.findById(item.destinationLocationId);
        if (!location || location.organisationId !== organisationId || !location.isActive) {
            throw new NotFoundException(...);
        }

        // Validates variant exists and is active
        const source = await this.productService.findVariantById(item.productVariantId);
        if (!source || !source.isActive) {
            throw new NotFoundException(...);
        }

        // ❌ NO VALIDATION HERE:
        // - Does NOT check if source.availableQty >= item.quantity
        // - Does NOT check inventory for the specific location
        // - Does NOT check if variant.stockManaged is true

        const organisationListing = await this.organisationProductService.ensureForProcurement(...);
        resolved.push({...});  // Always succeeds!
    }
    return resolved;
}
```

**Problem:** Creates procurement order without checking if stock exists!

### Issue 6: `validateItems()` Only Checks for Duplicates

**Location:** [src/modules/e-commerce/organisation-product-purchase/organisation-product-purchase.service.ts](src/modules/e-commerce/organisation-product-purchase/organisation-product-purchase.service.ts#L350)

```typescript
private validateItems(command: CreateProcurementOrderCommand): void {
    const itemKeys = new Set<string>();
    for (const item of command.items) {
        const key = `${item.productVariantId}:${item.destinationLocationId}`;
        if (itemKeys.has(key)) {
            throw new ConflictException(...);  // Only duplicate check!
        }
        itemKeys.add(key);
    }
    // ❌ No quantity validation here
}
```

---

## IMPACT & SCENARIOS

### Scenario 1: Race Condition

1. User selects 10 bottles (availableQty = 50)
2. While user fills form, another order consumes 45 bottles
3. availableQty now = 5
4. Button still enabled (based on old availableQty >= 0)
5. User clicks "Create and charge"
6. Order created successfully even though only 5 available (overselling!)

### Scenario 2: Location-Specific Shortage

1. Product has 100 bottles total (availableQty = 100 globally)
2. 90 bottles at Location A, 10 bottles at Location B
3. User selects Location B and tries to buy 50 bottles
4. Button ENABLED (availableQty = 100 >= 50) ❌
5. Order created, inventory system blocks it with insufficient stock error

### Scenario 3: Zero Availability After Toggle

1. User selects variant with availableQty = 5
2. Another user buys those 5 bottles
3. User still has variant selected but availableQty now = 0
4. Button still enabled (only checks if size > 0, not if qty > 0)
5. Order fails at backend

---

## RECOMMENDED FIXES

### Frontend Fix 1: Enhance `canSubmit` Validation

```typescript
const canSubmit = computed(
    () =>
        Boolean(destinationLocationId.value) &&
        selectedVariantIds.value.size > 0 &&
        (isInternal.value || Boolean(activeCreditCard.value)) &&
        // NEW: Validate all selected items have available quantity
        [...selectedVariantIds.value].every((variantId) => {
            const row = variantRows.value.find((r) => r.variantId === variantId)
            const quantity = quantities.value[variantId] ?? 1
            return row && row.availableQty >= quantity && quantity > 0
        })
)
```

### Frontend Fix 2: Show Validation Errors

```vue
<v-alert v-if="selectedVariantIds.size > 0 && !canSubmit" type="error">
    One or more items have insufficient available quantity.
</v-alert>
```

### Frontend Fix 3: Use Location-Specific Inventory

Change backend API to return availableQty per location, not global sum.

### Backend Fix 1: Validate Quantity in `resolveItems()`

```typescript
// After fetching variant
const availableAtLocation = await this.inventoryRepository.getBalance(
    organisationId,
    item.productVariantId,
    item.destinationLocationId
)
const available = availableAtLocation.onHand - availableAtLocation.reserved
if (available < item.quantity) {
    throw new ConflictException(
        `Insufficient inventory for variant ${item.productVariantId} at location ${item.destinationLocationId}. ` +
            `Requested: ${item.quantity}, Available: ${available}`
    )
}
```

### Backend Fix 2: Check Stock is Managed

```typescript
if (!source.stockManaged) {
    // Only allow procurement for stock-tracked variants
    throw new BadRequestException(`Variant is not tracked for inventory`)
}
```

---

## Summary Table

| Issue                                    | Severity | Location         | Type        | Impact                                 |
| ---------------------------------------- | -------- | ---------------- | ----------- | -------------------------------------- |
| `canSubmit` missing availableQty check   | HIGH     | Frontend         | Logic       | Button enabled when should be disabled |
| Race condition on availableQty           | HIGH     | Frontend         | Concurrency | Overselling possible                   |
| Global vs location-specific inventory    | HIGH     | Frontend+Backend | Design      | Allows buying from empty locations     |
| `resolveItems()` no quantity validation  | CRITICAL | Backend          | Logic       | Orders created without checking stock  |
| `validateItems()` only checks duplicates | MEDIUM   | Backend          | Logic       | No quantity/availability validation    |
