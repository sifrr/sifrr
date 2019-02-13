async function assertStateValue(type, value) {
  const stateValue = await page.$eval(`twoway-${type}`, el => {
    return el.$('div').textContent;
  });

  assert.equal(stateValue, value);
}

async function assertHtmlValue(type, value) {
  const val = await page.$eval(`twoway-${type}`, el => {
    return {
      html: el.$('#html').innerHTML,
      text: el.$('#html').textContent
    };
  });

  assert.equal(val.html, value);
  assert.notEqual(val.text, value);
}

function getField(type) {
  const selector = type === 'content' ? 'div[contenteditable]' : type;
  return page.evaluateHandle(`document.querySelector('twoway-${type}').shadowRoot.querySelector('${selector}')`);
}

async function getFieldValue(type) {
  const field = await getField(type);
  return await page.evaluate((el) => el.value || el.innerHTML, field);
}

async function assertFieldValue(type, value) {
  const fieldValue = await getFieldValue(type);

  assert.equal(fieldValue, value);
}

describe('Two way bind', () => {
  before(async () => {
    await page.goto(`${PATH}/twoway.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  describe('input', () => {
    it('has default value', async () => {
      await assertStateValue('input', 'input');
      await assertFieldValue('input', 'input');
    });

    it('updates value on field input', async () => {
      const input = await getField('input');
      await input.type('some');

      await assertStateValue('input', 'someinput');
      await assertFieldValue('input', 'someinput');
    });

    it('works with html', async () => {
      const input = await getField('input');
      await input.click({ clickCount: 3 });
      await input.type('some <p>para</p> end');

      await assertHtmlValue('input', 'some <p>para</p> end');
    });
  });

  describe('select', () => {
    it('has default value', async () => {
      await assertStateValue('select', 'volvo');
      await assertFieldValue('select', 'volvo');
    });

    it('updates value on field input', async () => {
      const select = await getField('select');
      await select.type('audi');

      await assertStateValue('select', 'audi');
      await assertFieldValue('select', 'audi');
    });
  });

  describe('textarea', () => {
    it('has default value', async () => {
      await assertStateValue('textarea', 'textarea');
      await assertFieldValue('textarea', 'textarea');
    });

    it('updates value on field input', async () => {
      const textarea = await getField('textarea');
      await textarea.type('some');

      await assertStateValue('textarea', 'textareasome');
      await assertFieldValue('textarea', 'textareasome');
    });

    it('works with html', async () => {
      const textarea = await getField('textarea');
      await textarea.click({ clickCount: 3 });
      await textarea.type('some <p>para</p> end');

      await assertHtmlValue('textarea', 'some <p>para</p> end');
    });
  });

  describe('contenteditable', () => {
    it('has default value', async () => {
      await assertStateValue('content', 'content');
      await assertFieldValue('content', 'content');
    });

    it('updates value on field input', async () => {
      const content = await getField('content');
      await content.type('some');

      await assertStateValue('content', 'somecontent');
      await assertFieldValue('content', 'somecontent');
    });

    it('works with html', async () => {
      const content = await getField('content');
      await content.click({ clickCount: 3 });
      await content.type('some <p attr="ok">para</p> end');

      await assertHtmlValue('content', 'some <p attr="ok">para</p> end');

      await content.click({ clickCount: 3 });
      await content.type('some <p>para</p> end');

      await assertHtmlValue('content', 'some <p>para</p> end');

      await content.click({ clickCount: 3 });
      await content.type('some <a>what</a> end');

      await assertHtmlValue('content', 'some <a>what</a> end');
    });
  });
});
