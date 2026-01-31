import { Controller, Get, Param, Query } from "@nestjs/common";

@Controller("catalog")
export class CatalogController {
  @Get("categories")
  getCategories() {
    return {
      items: [
        { id: "cat-1", slug: "heybeli", name: "Heybeli Koleksiyonu" },
        { id: "cat-2", slug: "dijital", name: "Dijital Ürünler" },
      ],
    };
  }

  @Get("products")
  getProducts(@Query("category") category?: string) {
    return {
      category,
      items: [
        {
          id: "prod-1",
          slug: "heybeli-canta",
          name: "Heybeli Çanta",
          price: 890,
        },
        {
          id: "prod-2",
          slug: "dijital-kalip",
          name: "Dijital Kalıp",
          price: 199,
        },
      ],
    };
  }

  @Get("products/:slug")
  getProduct(@Param("slug") slug: string) {
    return {
      id: "prod-1",
      slug,
      name: "Heybeli Çanta",
      price: 890,
      stock: 12,
    };
  }
}
