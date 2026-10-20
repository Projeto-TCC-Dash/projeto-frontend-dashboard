import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredAuth,
  apiClient,
  ApiClientError,
} from "./api-client";

describe("apiClient Storage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve persistir e recuperar token JWT corretamente", () => {
    expect(getStoredToken()).toBeNull();
    setStoredToken("jwt-token-123");
    expect(getStoredToken()).toBe("jwt-token-123");
  });

  it("deve persistir e recuperar usuário estruturado", () => {
    const user = { id: "user-1", email: "teste@exemplo.com", hasAiKey: true };
    setStoredUser(user);
    expect(getStoredUser()).toEqual(user);
  });

  it("deve limpar credenciais ao acionar clearStoredAuth", () => {
    setStoredToken("token-abc");
    setStoredUser({ id: "1", email: "a@b.com", hasAiKey: false });
    clearStoredAuth();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});

describe("apiClient HTTP Request Execution", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve injetar cabeçalho Authorization quando houver token armazenado", async () => {
    setStoredToken("token-seguro-jwt");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await apiClient.get<{ status: string }>("/api/teste");
    expect(response).toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(requestHeaders.get("Authorization")).toBe("Bearer token-seguro-jwt");
  });

  it("não deve definir cabeçalho Content-Type em requisições DELETE ou GET sem corpo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.delete("/api/accounts/123?cascade=true");
    const deleteHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(deleteHeaders.has("Content-Type")).toBe(false);

    await apiClient.get("/api/accounts");
    const getHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Headers;
    expect(getHeaders.has("Content-Type")).toBe(false);

    await apiClient.post("/api/accounts", { name: "Teste" });
    const postHeaders = fetchMock.mock.calls[2]?.[1]?.headers as Headers;
    expect(postHeaders.get("Content-Type")).toBe("application/json");
  });

  it("deve lançar ApiClientError com mensagem do backend em caso de falha HTTP", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Credenciais inválidas" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.post("/api/auth/login", { email: "a@b.com", password: "123" }))
      .rejects.toThrow(ApiClientError);

    try {
      await apiClient.post("/api/auth/login", { email: "a@b.com", password: "123" });
    } catch (err: unknown) {
      expect((err as ApiClientError).status).toBe(400);
      expect((err as ApiClientError).message).toBe("Credenciais inválidas");
    }
  });
});
