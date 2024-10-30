import Vue from "vue";
import VueI18n, { LocaleMessages } from "vue-i18n";

Vue.use(VueI18n);

function loadLocaleMessages(): LocaleMessages {
  const locales = require.context(
    "./locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages: LocaleMessages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

// Завантаження мови з localStorage або встановлення за замовчуванням
const savedLanguage = localStorage.getItem("preferredLanguage") || "ua";

export default new VueI18n({
  locale: savedLanguage, // Використовуємо збережену мову або "ua" за замовчуванням
  fallbackLocale: "en", // Резервна мова
  messages: loadLocaleMessages()
});