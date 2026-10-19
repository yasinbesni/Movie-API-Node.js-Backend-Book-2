export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Movie API",
    version: "1.0.0",
    description:
      "Node.js, Express, MongoDB ve Mongoose ile geliştirilen Movie API.",
  },
  servers: [
    {
      url: "/",
      description:
        "Dokümantasyonun açıldığı server",
    },
  ],
  paths: {
    "/movies": {
      get: {
        summary: "Filmleri listeler",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 10,
            },
          },
          {
            in: "query",
            name: "year",
            schema: {
              type: "integer",
              minimum: 1888,
            },
          },
          {
            in: "query",
            name: "minVoteAverage",
            schema: {
              type: "number",
              minimum: 0,
              maximum: 10,
            },
          },
          {
            in: "query",
            name: "q",
            schema: {
              type: "string",
              minLength: 1,
              maxLength: 50,
            },
          },
        ],
        responses: {
          200: {
            description:
              "Film listesi başarıyla getirildi.",
            content: {
              "application/json": {
                schema: {
                  $ref:
                    "#/components/schemas/MovieListResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Yeni film oluşturur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/CreateMovieInput",
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "Film başarıyla oluşturuldu.",
          },
          400: {
            description:
              "Request Body geçersiz.",
          },
          409: {
            description:
              "Aynı kayıt zaten mevcut.",
          },
        },
      },
    },
    "/movies/{movieId}": {
      parameters: [
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "Movie Document ObjectId değeri",
        },
      ],
      get: {
        summary: "Tek filmi getirir",
        responses: {
          200: {
            description: "Film getirildi.",
          },
          400: {
            description:
              "Movie id biçimi geçersiz.",
          },
          404: {
            description: "Film bulunamadı.",
          },
        },
      },
      patch: {
        summary: "Filmi günceller",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/UpdateMovieInput",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Film güncellendi.",
          },
          400: {
            description:
              "Request veya Movie id geçersiz.",
          },
          404: {
            description: "Film bulunamadı.",
          },
        },
      },
      delete: {
        summary: "Filmi siler",
        responses: {
          200: {
            description:
              "Film silindi ve silinen Movie Response'ta döndürüldü.",
          },
          400: {
            description:
              "Movie id biçimi geçersiz.",
          },
          404: {
            description: "Film bulunamadı.",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Movie: {
        type: "object",
        properties: {
          _id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          releaseYear: {
            type: "integer",
          },
          voteAverage: {
            type: "number",
          },
        },
      },
      CreateMovieInput: {
        type: "object",
        required: ["title"],
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            pattern: "\S",
            example: "Dune",
          },
          releaseYear: {
            type: "integer",
            minimum: 1888,
            example: 2021,
          },
          voteAverage: {
            type: "number",
            minimum: 0,
            maximum: 10,
            example: 8.3,
          },
        },
      },
      UpdateMovieInput: {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            pattern: "\S",
          },
          releaseYear: {
            type: "integer",
            minimum: 1888,
          },
          voteAverage: {
            type: "number",
            minimum: 0,
            maximum: 10,
          },
        },
      },
      MovieListResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          data: {
            type: "array",
            items: {
              $ref:
                "#/components/schemas/Movie",
            },
          },
          meta: {
            type: "object",
            properties: {
              page: {
                type: "integer",
              },
              limit: {
                type: "integer",
              },
              totalItems: {
                type: "integer",
              },
              totalPages: {
                type: "integer",
              },
              hasNext: {
                type: "boolean",
              },
              hasPrevious: {
                type: "boolean",
              },
            },
          },
        },
      },
    },
  },
};
