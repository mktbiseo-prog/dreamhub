// ---------------------------------------------------------------------------
// i18n Middleware Integration Tests
//
// Tests:
//   1. 7 languages return correct localized error messages
//   2. Accept-Language: ar → direction: rtl in meta
//   3. No Accept-Language → defaults to English
//   4. Localized match explanation
//   5. X-Preferred-Language overrides Accept-Language
//   6. Meta included in success and error responses
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";
import { t } from "@dreamhub/i18n/translator";

/** Helper: create a mock Request with headers */
function mockRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", { headers });
}

describe("i18n Middleware — Locale Detection & Translation", () => {
  it("defaults to English when no Accept-Language header", () => {
    const i18n = i18nMiddleware(mockRequest());
    expect(i18n.locale).toBe("en");
    expect(i18n.meta.locale).toBe("en");
    expect(i18n.meta.direction).toBe("ltr");
    expect(i18n.isRTL).toBe(false);
  });

  it("detects Korean from Accept-Language header", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ko-KR,ko;q=0.9,en;q=0.5",
    }));
    expect(i18n.locale).toBe("ko");
    expect(i18n.meta.direction).toBe("ltr");
  });

  it("detects Arabic and returns RTL direction", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ar-SA,ar;q=0.9",
    }));
    expect(i18n.locale).toBe("ar");
    expect(i18n.meta.direction).toBe("rtl");
    expect(i18n.isRTL).toBe(true);
  });

  it("X-Preferred-Language overrides Accept-Language", () => {
    const i18n = i18nMiddleware(mockRequest({
      "x-preferred-language": "ja",
      "accept-language": "en-US,en;q=0.9",
    }));
    expect(i18n.locale).toBe("ja");
  });
});

describe("i18n Middleware — Localized Error Messages (7 languages)", () => {
  const testCases: Array<{ locale: string; header: string; expected: string }> = [
    { locale: "en", header: "en-US", expected: "Please log in to continue" },
    { locale: "ko", header: "ko-KR", expected: "계속하려면 로그인해 주세요" },
    { locale: "es", header: "es-ES", expected: "Inicia sesión para continuar" },
    { locale: "pt", header: "pt-BR", expected: "Faça login para continuar" },
    { locale: "ar", header: "ar-SA", expected: "يرجى تسجيل الدخول للمتابعة" },
    { locale: "zh-HK", header: "zh-HK", expected: "請登入以繼續" },
    { locale: "ja", header: "ja-JP", expected: "続けるにはログインしてください" },
  ];

  for (const { locale, header, expected } of testCases) {
    it(`error.unauthorized in ${locale}: "${expected}"`, () => {
      const i18n = i18nMiddleware(mockRequest({
        "accept-language": header,
      }));
      expect(i18n.t("error.unauthorized")).toBe(expected);
    });
  }

  it("error.forbidden in all 7 languages", () => {
    const expectedForbidden: Record<string, string> = {
      en: "You don't have permission to do this",
      ko: "이 작업을 수행할 권한이 없습니다",
      es: "No tienes permiso para hacer esto",
      pt: "Você não tem permissão para fazer isso",
      ar: "ليس لديك صلاحية للقيام بذلك",
      "zh-HK": "你沒有權限執行此操作",
      ja: "この操作を行う権限がありません",
    };

    for (const [locale, expected] of Object.entries(expectedForbidden)) {
      const i18n = i18nMiddleware(mockRequest({
        "x-preferred-language": locale,
      }));
      expect(i18n.t("error.forbidden")).toBe(expected);
    }
  });

  it("error.serverError in all 7 languages", () => {
    const expected: Record<string, string> = {
      en: "Something went wrong. Please try again.",
      ko: "문제가 발생했습니다. 다시 시도해 주세요.",
      es: "Algo salió mal. Inténtalo de nuevo.",
      pt: "Algo deu errado. Tente novamente.",
      ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      "zh-HK": "出了點問題，請再試一次。",
      ja: "問題が発生しました。もう一度お試しください。",
    };

    for (const [locale, text] of Object.entries(expected)) {
      const i18n = i18nMiddleware(mockRequest({
        "x-preferred-language": locale,
      }));
      expect(i18n.t("error.serverError")).toBe(text);
    }
  });

  it("error.validation in all 7 languages", () => {
    const expected: Record<string, string> = {
      en: "Please check your input",
      ko: "입력 내용을 확인해 주세요",
      es: "Por favor, verifica tus datos",
      pt: "Por favor, verifique seus dados",
      ar: "يرجى التحقق من المدخلات",
      "zh-HK": "請檢查你的輸入",
      ja: "入力内容を確認してください",
    };

    for (const [locale, text] of Object.entries(expected)) {
      const i18n = i18nMiddleware(mockRequest({
        "x-preferred-language": locale,
      }));
      expect(i18n.t("error.validation")).toBe(text);
    }
  });
});

describe("i18n Middleware — RTL Detection", () => {
  it("Arabic Accept-Language → direction: rtl", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ar",
    }));
    expect(i18n.meta).toEqual({ locale: "ar", direction: "rtl" });
  });

  it("Korean Accept-Language → direction: ltr", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ko",
    }));
    expect(i18n.meta).toEqual({ locale: "ko", direction: "ltr" });
  });

  it("Japanese Accept-Language → direction: ltr", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ja",
    }));
    expect(i18n.meta).toEqual({ locale: "ja", direction: "ltr" });
  });
});

describe("i18n Middleware — Fallback Behavior", () => {
  it("no Accept-Language → English fallback", () => {
    const i18n = i18nMiddleware(mockRequest());
    expect(i18n.t("button.save")).toBe("Save");
    expect(i18n.t("error.unauthorized")).toBe("Please log in to continue");
    expect(i18n.locale).toBe("en");
  });

  it("unsupported locale → English fallback", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "fr-FR",
    }));
    expect(i18n.t("button.save")).toBe("Save");
    expect(i18n.locale).toBe("en");
  });

  it("missing key falls back to key itself", () => {
    const i18n = i18nMiddleware(mockRequest({
      "accept-language": "ko",
    }));
    expect(i18n.t("nonexistent.key")).toBe("nonexistent.key");
  });
});

describe("i18n Middleware — Localized Match Description", () => {
  it("match score in English", () => {
    const i18n = i18nMiddleware(mockRequest({ "accept-language": "en" }));
    expect(i18n.t("place.match.score", { score: 85 }))
      .toBe("Match Score: 85%");
  });

  it("match score in Korean", () => {
    const i18n = i18nMiddleware(mockRequest({ "accept-language": "ko" }));
    expect(i18n.t("place.match.score", { score: 85 }))
      .toBe("매칭 점수: 85%");
  });

  it("match score in Arabic (RTL)", () => {
    const i18n = i18nMiddleware(mockRequest({ "accept-language": "ar" }));
    expect(i18n.t("place.match.score", { score: 85 }))
      .toBe("درجة التطابق: 85%");
  });

  it("match score in Japanese", () => {
    const i18n = i18nMiddleware(mockRequest({ "accept-language": "ja" }));
    expect(i18n.t("place.match.score", { score: 92 }))
      .toBe("マッチスコア：92%");
  });

  it("match vision/skills/trust labels in multiple languages", () => {
    const koI18n = i18nMiddleware(mockRequest({ "accept-language": "ko" }));
    expect(koI18n.t("place.match.vision")).toBe("비전 일치도");
    expect(koI18n.t("place.match.skills")).toBe("스킬 상호보완성");

    const arI18n = i18nMiddleware(mockRequest({ "accept-language": "ar" }));
    expect(arI18n.t("place.match.vision")).toBe("توافق الرؤية");
    expect(arI18n.t("place.match.trust")).toBe("مؤشر الثقة");
  });
});

describe("i18n Middleware — Plain Object Headers", () => {
  it("works with plain header objects (non-Request)", () => {
    const i18n = i18nMiddleware({
      headers: {
        "accept-language": "es",
        "x-preferred-language": undefined,
      },
    });
    expect(i18n.locale).toBe("es");
    expect(i18n.t("button.save")).toBe("Guardar");
  });
});
