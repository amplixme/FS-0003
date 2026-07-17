// @vitest-environment jsdom
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "vitest";
import api from "./api";
import { getAll } from "./post.service";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
});

describe("post.service getAll", () => {
  it("envía page, limit, category, sort y search como query params", async () => {
    const payload = { data: [], total: 0, page: 2, totalPages: 0 };
    mock.onGet("/posts").reply(200, payload);

    const result = await getAll({
      page: 2,
      limit: 10,
      category: "tecnologia",
      sort: "oldest",
      search: "react router",
    });

    expect(mock.history.get).toHaveLength(1);
    expect(mock.history.get[0].params).toEqual({
      page: 2,
      limit: 10,
      category: "tecnologia",
      sort: "oldest",
      search: "react router",
    });
    expect(result).toEqual(payload);
  });
});
