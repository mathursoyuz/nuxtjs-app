import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
    createMembershipSlug,
    isMembershipSlugConfirmedDuplicate,
    isMembershipSlugValid,
} from '../app/utils/membership-slug.util.ts'

test('membership names generate editable URL-safe slugs', () => {
    assert.equal(createMembershipSlug('  Gold & Rosé Club  '), 'gold-rose-club')
    assert.equal(isMembershipSlugValid('gold-rose-club'), true)
    assert.equal(isMembershipSlugValid('Gold Rose Club'), false)
})

test('only a confirmed duplicate slug blocks a membership form', () => {
    assert.equal(isMembershipSlugConfirmedDuplicate(true), false)
    assert.equal(isMembershipSlugConfirmedDuplicate(null), false)
    assert.equal(isMembershipSlugConfirmedDuplicate(false), true)
})

test('every slug form explicitly imports its shared field component', () => {
    const forms = [
        'AddMembershipTypeDialog.vue',
        'EditMembershipTypeDialog.vue',
        'AddPlatformMembershipDialog.vue',
        'EditPlatformMembershipDialog.vue',
        'AddOrganisationMembershipDialog.vue',
        'EditOrganisationMembershipDialog.vue',
    ]

    for (const form of forms) {
        const source = readFileSync(
            new URL(`../app/components/memberships/${form}`, import.meta.url),
            'utf8'
        )
        assert.match(source, /import MembershipSlugField from ['"]\.\/MembershipSlugField\.vue['"]/)
    }
})

test('membership dialogs explicitly import shared sibling components', () => {
    const requiredImports = {
        'CancelCustomerMembershipDialog.vue': ['MembershipSubscriptionSummaryCard'],
        'RejoinCustomerMembershipDialog.vue': ['MembershipSubscriptionSummaryCard'],
        'CancelOrganisationMembershipDialog.vue': ['MembershipSubscriptionSummaryCard'],
        'RejoinOrganisationMembershipDialog.vue': ['MembershipSubscriptionSummaryCard'],
        'OrganisationMembershipManagerDialog.vue': [
            'AddMembershipTypeDialog',
            'AddOrganisationMembershipDialog',
            'CustomerSubscriptionSearchDialog',
            'EditMembershipTypeDialog',
            'EditOrganisationMembershipDialog',
            'MembershipSubscribersDialog',
        ],
    }

    for (const [file, components] of Object.entries(requiredImports)) {
        const source = readFileSync(
            new URL(`../app/components/memberships/${file}`, import.meta.url),
            'utf8'
        )
        for (const component of components) {
            assert.match(
                source,
                new RegExp(`import ${component} from ['"]\\./${component}\\.vue['"]`)
            )
        }
    }
})
