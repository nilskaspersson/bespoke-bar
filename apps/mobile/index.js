import "react-native-get-random-values";
import "@formatjs/intl-getcanonicallocales/polyfill.js";
import "@formatjs/intl-locale/polyfill.js";
/**
 * Hermes ships Intl.NumberFormat/DateTimeFormat but not PluralRules or
 * RelativeTimeFormat, which `createRelativeTimeFormatter` (@bespoke/domain)
 * needs. Locale data is loaded per LANGUAGE for every entry in the web app's
 * SUPPORTED_LOCALES (apps/bar/src/utils/locales.ts) — the org's
 * `defaultLocale` can be any of them, and regional variants resolve to their
 * base language.
 */
import "@formatjs/intl-pluralrules/polyfill.js";
import "@formatjs/intl-pluralrules/locale-data/ca.js";
import "@formatjs/intl-pluralrules/locale-data/cs.js";
import "@formatjs/intl-pluralrules/locale-data/cy.js";
import "@formatjs/intl-pluralrules/locale-data/da.js";
import "@formatjs/intl-pluralrules/locale-data/de.js";
import "@formatjs/intl-pluralrules/locale-data/en.js";
import "@formatjs/intl-pluralrules/locale-data/es.js";
import "@formatjs/intl-pluralrules/locale-data/et.js";
import "@formatjs/intl-pluralrules/locale-data/fi.js";
import "@formatjs/intl-pluralrules/locale-data/fr.js";
import "@formatjs/intl-pluralrules/locale-data/ga.js";
import "@formatjs/intl-pluralrules/locale-data/hr.js";
import "@formatjs/intl-pluralrules/locale-data/hu.js";
import "@formatjs/intl-pluralrules/locale-data/is.js";
import "@formatjs/intl-pluralrules/locale-data/it.js";
import "@formatjs/intl-pluralrules/locale-data/lt.js";
import "@formatjs/intl-pluralrules/locale-data/lv.js";
import "@formatjs/intl-pluralrules/locale-data/mt.js";
import "@formatjs/intl-pluralrules/locale-data/nb.js";
import "@formatjs/intl-pluralrules/locale-data/nl.js";
import "@formatjs/intl-pluralrules/locale-data/nn.js";
import "@formatjs/intl-pluralrules/locale-data/pl.js";
import "@formatjs/intl-pluralrules/locale-data/pt.js";
import "@formatjs/intl-pluralrules/locale-data/ro.js";
import "@formatjs/intl-pluralrules/locale-data/sk.js";
import "@formatjs/intl-pluralrules/locale-data/sl.js";
import "@formatjs/intl-pluralrules/locale-data/sq.js";
import "@formatjs/intl-pluralrules/locale-data/sv.js";
import "@formatjs/intl-relativetimeformat/polyfill.js";
import "@formatjs/intl-relativetimeformat/locale-data/ca.js";
import "@formatjs/intl-relativetimeformat/locale-data/cs.js";
import "@formatjs/intl-relativetimeformat/locale-data/cy.js";
import "@formatjs/intl-relativetimeformat/locale-data/da.js";
import "@formatjs/intl-relativetimeformat/locale-data/de.js";
import "@formatjs/intl-relativetimeformat/locale-data/en.js";
import "@formatjs/intl-relativetimeformat/locale-data/en-GB.js";
import "@formatjs/intl-relativetimeformat/locale-data/es.js";
import "@formatjs/intl-relativetimeformat/locale-data/et.js";
import "@formatjs/intl-relativetimeformat/locale-data/fi.js";
import "@formatjs/intl-relativetimeformat/locale-data/fr.js";
import "@formatjs/intl-relativetimeformat/locale-data/ga.js";
import "@formatjs/intl-relativetimeformat/locale-data/hr.js";
import "@formatjs/intl-relativetimeformat/locale-data/hu.js";
import "@formatjs/intl-relativetimeformat/locale-data/is.js";
import "@formatjs/intl-relativetimeformat/locale-data/it.js";
import "@formatjs/intl-relativetimeformat/locale-data/lt.js";
import "@formatjs/intl-relativetimeformat/locale-data/lv.js";
import "@formatjs/intl-relativetimeformat/locale-data/mt.js";
import "@formatjs/intl-relativetimeformat/locale-data/nb.js";
import "@formatjs/intl-relativetimeformat/locale-data/nl.js";
import "@formatjs/intl-relativetimeformat/locale-data/nn.js";
import "@formatjs/intl-relativetimeformat/locale-data/pl.js";
import "@formatjs/intl-relativetimeformat/locale-data/pt.js";
import "@formatjs/intl-relativetimeformat/locale-data/ro.js";
import "@formatjs/intl-relativetimeformat/locale-data/sk.js";
import "@formatjs/intl-relativetimeformat/locale-data/sl.js";
import "@formatjs/intl-relativetimeformat/locale-data/sq.js";
import "@formatjs/intl-relativetimeformat/locale-data/sv.js";
import "expo-router/entry";
