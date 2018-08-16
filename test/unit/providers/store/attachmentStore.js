// Copyright (c) Microsoft Corporation and others. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

const chai = require('chai')
const factory = require('../../../../providers/store/attachmentStoreFactory')
const { describe, it } = require('mocha')
const expect = chai.expect
const sinon = require('sinon')

describe('AttachmentStore', () => {
  it('have properly structured metadata', async () => {
    const { store } = setup()
    const document = {
      _metadata: { fetchedAt: 'now', processedAt: 'then', extra: 'value' },
      _attachments: [{ token: '42', attachment: '42 attachment' }, { token: '13', attachment: '13 attachment' }]
    }
    await store.upsert(document)
    const baseStore = store.baseStore
    expect(baseStore.upsert.calledThrice).to.be.true

    var storedDoc = baseStore.upsert.getCall(1).args[0]
    var metadata = storedDoc._metadata
    expect(metadata.type).to.be.eq('attachment')
    expect(metadata.fetchedAt).to.be.eq('now')
    expect(metadata.processedAt).to.be.eq('then')
    expect(metadata.extra).to.be.undefined
    expect(metadata.links.self.href).to.be.eq('urn:attachment:42')
    expect(metadata.url).to.be.eq('cd:/attachment/42')
    var attachment = storedDoc.attachment
    expect(attachment).to.be.eq('42 attachment')

    var storedDoc = baseStore.upsert.getCall(2).args[0]
    metadata = storedDoc._metadata
    expect(metadata.type).to.be.eq('attachment')
    expect(metadata.fetchedAt).to.be.eq('now')
    expect(metadata.processedAt).to.be.eq('then')
    expect(metadata.extra).to.be.undefined
    expect(metadata.links.self.href).to.be.eq('urn:attachment:13')
    expect(metadata.url).to.be.eq('cd:/attachment/13')
    attachment = storedDoc.attachment
    expect(attachment).to.be.eq('13 attachment')
  })

  it('should do nothing if no files', async () => {
    const { store } = setup()
    const document = {}
    await store.upsert(document)
    const baseStore = store.baseStore
    expect(baseStore.upsert.calledOnce).to.be.true
  })
})

function setup() {
  const realFactory = () => {
    return { upsert: sinon.stub() }
  }
  const store = factory(realFactory)({})
  return { store }
}