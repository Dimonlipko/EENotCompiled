export const BANK_REQUISITES = {
  companyName: 'ФОП Ліпко Дмитро Олегович',
  ipn: '3573011735',
  iban: 'UA543220010000026002370019520',
  bankName: 'АТ "УНІВЕРСАЛ БАНК"',
  mfo: '322001',
  bankEdrpou: '21133352',
  paymentPurpose(totalUah, ref) {
    return `Оплата автозапчастин, замовлення #${ref}, сума ${totalUah} грн`
  },
  /**
   * Генерує посилання на bank.gov.ua/qr/ для оплати через Monobank/PrivatBank.
   * Формат: NBU QR Code Specification (BCD/UCT).
   * Дані кодуються в Base64URL і додаються до URL.
   */
  privat24Link(amount, purpose) {
    const params = {
      receiver: { source: 'iban', iban: this.iban },
      purpose: purpose || 'Оплата автозапчастин',
    }
    if (amount) params.amount = amount
    return 'https://next.privat24.ua/payments/form/' + encodeURIComponent(JSON.stringify(params))
  },
  nbuQrLink(amount, purpose) {
    const lines = [
      'BCD',                                      // service label
      '001',                                      // version
      '1',                                        // encoding: 1 = UTF-8
      'UCT',                                      // function: Ukrainian Credit Transfer
      '',                                         // reserved
      this.companyName,                            // recipient
      this.iban,                                   // IBAN
      amount ? `UAH${amount}` : '',                // amount with currency
      this.ipn,                                    // tax ID (ІПН/ЄДРПОУ)
      '',                                         // reserved
      '',                                         // reserved
      purpose || 'Оплата автозапчастин',           // purpose
    ]
    const data = lines.join('\n')
    // Base64URL encoding (no padding)
    const base64 = btoa(unescape(encodeURIComponent(data)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return `https://bank.gov.ua/qr/${base64}`
  },
}
