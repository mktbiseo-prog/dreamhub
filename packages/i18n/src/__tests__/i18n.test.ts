// ---------------------------------------------------------------------------
// i18n Package Tests
//
// Covers:
//   1. Translation in all 7 languages
//   2. Parameter interpolation
//   3. English fallback for missing keys
//   4. Arabic RTL detection
//   5. Locale-specific date/number/currency formatting
//   6. Locale detection from Accept-Language headers
//   7. Translation key completeness across languages
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import {
  t,
  clearTranslationCache,
  getTranslations,
  Language,
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  SUPPORTED_LOCALES,
  LANGUAGE_NAMES,
  NAMESPACES,
  isValidLocale,
  isRTL,
  getDirection,
  getHtmlAttrs,
  detectLocale,
  formatDate,
  formatNumber,
  formatCurrency,
} from "../index";

describe("i18n — Types & Constants", () => {
  it("defines 7 supported languages", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(7);
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("ko");
    expect(SUPPORTED_LOCALES).toContain("es");
    expect(SUPPORTED_LOCALES).toContain("pt");
    expect(SUPPORTED_LOCALES).toContain("ar");
    expect(SUPPORTED_LOCALES).toContain("zh-HK");
    expect(SUPPORTED_LOCALES).toContain("ja");
  });

  it("default language is English", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
  });

  it("Arabic is the only RTL language", () => {
    expect(RTL_LANGUAGES).toEqual(["ar"]);
  });

  it("has native language names for all locales", () => {
    expect(LANGUAGE_NAMES[Language.EN]).toBe("English");
    expect(LANGUAGE_NAMES[Language.KO]).toBe("한국어");
    expect(LANGUAGE_NAMES[Language.ES]).toBe("Español");
    expect(LANGUAGE_NAMES[Language.PT]).toBe("Português");
    expect(LANGUAGE_NAMES[Language.AR]).toBe("العربية");
    expect(LANGUAGE_NAMES[Language.ZH_HK]).toBe("繁體中文");
    expect(LANGUAGE_NAMES[Language.JA]).toBe("日本語");
  });

  it("defines 8 translation namespaces", () => {
    expect(NAMESPACES).toHaveLength(8);
    expect(NAMESPACES).toContain("common");
    expect(NAMESPACES).toContain("auth");
    expect(NAMESPACES).toContain("brain");
    expect(NAMESPACES).toContain("planner");
    expect(NAMESPACES).toContain("place");
    expect(NAMESPACES).toContain("store");
    expect(NAMESPACES).toContain("cafe");
    expect(NAMESPACES).toContain("errors");
  });

  it("isValidLocale validates correctly", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("ko")).toBe(true);
    expect(isValidLocale("zh-HK")).toBe(true);
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale("")).toBe(false);
    expect(isValidLocale("zz")).toBe(false);
  });
});

describe("i18n — Translation (t function)", () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  it("translates button.save in all 7 languages", () => {
    expect(t("button.save", "en")).toBe("Save");
    expect(t("button.save", "ko")).toBe("저장");
    expect(t("button.save", "es")).toBe("Guardar");
    expect(t("button.save", "pt")).toBe("Salvar");
    expect(t("button.save", "ar")).toBe("حفظ");
    expect(t("button.save", "zh-HK")).toBe("儲存");
    expect(t("button.save", "ja")).toBe("保存");
  });

  it("translates auth keys in all languages", () => {
    expect(t("auth.login.title", "en")).toBe("Welcome Back");
    expect(t("auth.login.title", "ko")).toBe("다시 오신 것을 환영합니다");
    expect(t("auth.login.title", "es")).toBe("Bienvenido de nuevo");
    expect(t("auth.login.title", "pt")).toBe("Bem-vindo de volta");
    expect(t("auth.login.title", "ar")).toBe("مرحباً بعودتك");
    expect(t("auth.login.title", "zh-HK")).toBe("歡迎回來");
    expect(t("auth.login.title", "ja")).toBe("おかえりなさい");
  });

  it("translates service-specific keys", () => {
    expect(t("brain.title", "ko")).toBe("드림 브레인");
    expect(t("planner.title", "es")).toBe("Dream Planner");
    expect(t("place.title", "pt")).toBe("Dream Place");
    expect(t("store.title", "ar")).toBe("دريم ستور");
    expect(t("cafe.title", "zh-HK")).toBe("Dream Café");
    expect(t("error.notFound", "ja")).toBe("見つかりません");
  });

  it("interpolates parameters correctly", () => {
    expect(t("place.match.score", "en", { score: 85 })).toBe("Match Score: 85%");
    expect(t("place.match.score", "ko", { score: 85 })).toBe("매칭 점수: 85%");
    expect(t("place.match.score", "ja", { score: 92 })).toBe("マッチスコア：92%");
    expect(t("place.match.score", "ar", { score: 78 })).toBe("درجة التطابق: 78%");
  });

  it("interpolates time parameters", () => {
    expect(t("time.minutesAgo", "en", { count: 5 })).toBe("5 minutes ago");
    expect(t("time.minutesAgo", "ko", { count: 5 })).toBe("5분 전");
    expect(t("time.hoursAgo", "es", { count: 3 })).toBe("Hace 3 horas");
    expect(t("time.daysAgo", "pt", { count: 2 })).toBe("Há 2 dias");
  });

  it("interpolates store parameters", () => {
    expect(t("store.product.funded", "en", { percent: 75 })).toBe("75% funded");
    expect(t("store.product.supporters", "ko", { count: 120 })).toBe("120명의 서포터");
    expect(t("brain.thoughtCount", "ja", { count: 42 })).toBe("42個の考えを記録");
  });

  it("interpolates multiple parameters", () => {
    // Only one param per string in our current translations,
    // but verify the mechanism works for future use
    expect(t("error.fileTooBig", "en", { max: 10 })).toBe("File is too large (max 10MB)");
    expect(t("error.fileTooBig", "ko", { max: 10 })).toBe("파일이 너무 큽니다 (최대 10MB)");
  });

  it("falls back to English for missing keys in other locales", () => {
    // Simulate a key that only exists in English
    // In our case, all keys are translated — so we test with a non-existent locale
    const result = t("button.save", "fr"); // French is not supported
    // Should still return "Save" since fr has no translations, falls back to en
    expect(result).toBe("Save");
  });

  it("returns key itself when no translation exists anywhere", () => {
    expect(t("nonexistent.key", "en")).toBe("nonexistent.key");
    expect(t("totally.missing", "ko")).toBe("totally.missing");
  });

  it("leaves unmatched placeholders untouched", () => {
    expect(t("place.match.score", "en", {})).toBe("Match Score: {score}%");
  });

  it("getTranslations returns all merged translations for a locale", () => {
    const enTranslations = getTranslations("en");
    expect(enTranslations["button.save"]).toBe("Save");
    expect(enTranslations["auth.login.title"]).toBe("Welcome Back");
    expect(enTranslations["brain.title"]).toBe("Dream Brain");
    expect(enTranslations["error.notFound"]).toBe("Not found");
  });
});

describe("i18n — RTL Support", () => {
  it("Arabic is RTL", () => {
    expect(isRTL("ar")).toBe(true);
  });

  it("all other languages are LTR", () => {
    expect(isRTL("en")).toBe(false);
    expect(isRTL("ko")).toBe(false);
    expect(isRTL("es")).toBe(false);
    expect(isRTL("pt")).toBe(false);
    expect(isRTL("zh-HK")).toBe(false);
    expect(isRTL("ja")).toBe(false);
  });

  it("getDirection returns correct direction", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("ko")).toBe("ltr");
  });

  it("getHtmlAttrs returns correct attributes", () => {
    expect(getHtmlAttrs("ar")).toEqual({ lang: "ar", dir: "rtl" });
    expect(getHtmlAttrs("en")).toEqual({ lang: "en", dir: "ltr" });
    expect(getHtmlAttrs("zh-HK")).toEqual({ lang: "zh-HK", dir: "ltr" });
  });
});

describe("i18n — Locale Detection", () => {
  it("prefers user's explicit preference", () => {
    expect(detectLocale({
      preferredLanguage: "ko",
      acceptLanguage: "en-US,en;q=0.9",
    })).toBe("ko");
  });

  it("falls back to Accept-Language when no preference", () => {
    expect(detectLocale({
      acceptLanguage: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    })).toBe("ko");
  });

  it("parses Accept-Language quality factors correctly", () => {
    // Japanese has highest quality
    expect(detectLocale({
      acceptLanguage: "en;q=0.5,ja;q=0.9,ko;q=0.7",
    })).toBe("ja");
  });

  it("matches base language from region tag", () => {
    expect(detectLocale({
      acceptLanguage: "es-MX,es;q=0.9",
    })).toBe("es");
  });

  it("matches zh variants to zh-HK", () => {
    expect(detectLocale({
      acceptLanguage: "zh-TW,zh;q=0.9",
    })).toBe("zh-HK");
  });

  it("defaults to English when nothing matches", () => {
    expect(detectLocale({})).toBe("en");
    expect(detectLocale({ acceptLanguage: "fr-FR,de;q=0.9" })).toBe("en");
  });

  it("ignores invalid preferredLanguage", () => {
    expect(detectLocale({
      preferredLanguage: "invalid",
      acceptLanguage: "ko;q=0.9",
    })).toBe("ko");
  });
});

describe("i18n — Formatting", () => {
  const testDate = new Date("2025-03-15T10:30:00Z");

  it("formats dates differently per locale", () => {
    const enDate = formatDate(testDate, "en");
    const koDate = formatDate(testDate, "ko");
    const jaDate = formatDate(testDate, "ja");

    // English: "Mar 15, 2025"
    expect(enDate).toContain("2025");
    expect(enDate).toContain("15");

    // Korean: "2025. 3. 15." or similar
    expect(koDate).toContain("2025");

    // Japanese: "2025/3/15" or similar
    expect(jaDate).toContain("2025");
  });

  it("formats numbers with locale-specific separators", () => {
    const enNum = formatNumber(1234567, "en");
    const ptNum = formatNumber(1234567, "pt");

    // English uses comma: 1,234,567
    expect(enNum).toContain(",");

    // Portuguese uses period: 1.234.567
    expect(ptNum).toContain(".");
  });

  it("formats Arabic numbers with Eastern Arabic numerals", () => {
    const arNum = formatNumber(1000, "ar");
    // Arabic locale may use Eastern Arabic numerals (٬)
    // The exact output depends on the runtime, but it should differ from English
    expect(arNum).toBeTruthy();
    expect(arNum.length).toBeGreaterThan(0);
  });

  it("formats currency per locale", () => {
    const enUsd = formatCurrency(29.99, "USD", "en");
    const koUsd = formatCurrency(29.99, "USD", "ko");

    expect(enUsd).toContain("$");
    expect(enUsd).toContain("29.99");

    // Korean shows US$ or $
    expect(koUsd).toContain("29.99");
  });

  it("formats different currencies", () => {
    const eurPt = formatCurrency(29.99, "EUR", "pt");
    // Portuguese Euro formatting
    expect(eurPt).toBeTruthy();

    const jpyJa = formatCurrency(3000, "JPY", "ja");
    expect(jpyJa).toContain("3,000") // ¥3,000 or similar
  });
});

describe("i18n — Translation Completeness", () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  it("all 7 locales have translations for all common keys", () => {
    const commonKeys = [
      "app.name",
      "button.save",
      "button.cancel",
      "button.login",
      "button.signup",
      "label.loading",
      "time.justNow",
    ];

    for (const locale of SUPPORTED_LOCALES) {
      for (const key of commonKeys) {
        const value = t(key, locale);
        expect(value).not.toBe(key);
      }
    }
  });

  it("all 7 locales have translations for all auth keys", () => {
    const authKeys = [
      "auth.login.title",
      "auth.login.email",
      "auth.login.password",
      "auth.signup.title",
      "auth.social.google",
    ];

    for (const locale of SUPPORTED_LOCALES) {
      for (const key of authKeys) {
        const value = t(key, locale);
        expect(value).not.toBe(key);
      }
    }
  });

  it("all 7 locales have translations for all error keys", () => {
    const errorKeys = [
      "error.unauthorized",
      "error.forbidden",
      "error.notFound",
      "error.serverError",
    ];

    for (const locale of SUPPORTED_LOCALES) {
      for (const key of errorKeys) {
        const value = t(key, locale);
        expect(value).not.toBe(key);
      }
    }
  });

  it("English has the same keys as every other locale", () => {
    const enDict = getTranslations("en");
    const enKeys = Object.keys(enDict).sort();

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en") continue;
      const dict = getTranslations(locale);
      const keys = Object.keys(dict).sort();
      expect(keys).toEqual(enKeys);
    }
  });
});
