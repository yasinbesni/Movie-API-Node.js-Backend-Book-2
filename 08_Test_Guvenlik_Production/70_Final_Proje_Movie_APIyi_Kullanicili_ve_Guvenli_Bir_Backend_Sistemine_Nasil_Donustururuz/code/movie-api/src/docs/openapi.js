export const openApiDocument = {
  "openapi": "3.0.3",
  "info": {
    "title": "Movie API — 2. Kitap",
    "version": "2.0.0",
    "description": "GET /auth/csrf ile başlayın. Mutasyonlarda aynı istemcinin çerezlerini ve X-CSRF-Token başlığını gönderin. Alan şemaları src/validation altında, kullanım README.md içindedir."
  },
  "paths": {
    "/health": {
      "get": {
        "summary": "GET /health",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      }
    },
    "/movies": {
      "get": {
        "summary": "GET /movies",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      },
      "post": {
        "summary": "POST /movies",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/movies/{movieId}": {
      "get": {
        "summary": "GET /movies/{movieId}",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          }
        ]
      },
      "patch": {
        "summary": "PATCH /movies/{movieId}",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          },
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "delete": {
        "summary": "DELETE /movies/{movieId}",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          },
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/auth/csrf": {
      "get": {
        "summary": "GET /auth/csrf",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      }
    },
    "/auth/register": {
      "post": {
        "summary": "POST /auth/register",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "summary": "POST /auth/login",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/jwt/login": {
      "post": {
        "summary": "POST /auth/jwt/login",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      "post": {
        "summary": "POST /auth/refresh",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/auth/logout": {
      "post": {
        "summary": "POST /auth/logout",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/auth/verify-email": {
      "post": {
        "summary": "POST /auth/verify-email",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/forgot-password": {
      "post": {
        "summary": "POST /auth/forgot-password",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/reset-password": {
      "post": {
        "summary": "POST /auth/reset-password",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/auth/send-verification-email": {
      "post": {
        "summary": "POST /auth/send-verification-email",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/users/me": {
      "get": {
        "summary": "GET /users/me",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      },
      "patch": {
        "summary": "PATCH /users/me",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "delete": {
        "summary": "DELETE /users/me",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/users/me/movies": {
      "get": {
        "summary": "GET /users/me/movies",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      }
    },
    "/users/me/avatar": {
      "post": {
        "summary": "POST /users/me/avatar",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/users/me/email-change": {
      "post": {
        "summary": "POST /users/me/email-change",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/users/me/email-change/confirm": {
      "post": {
        "summary": "POST /users/me/email-change/confirm",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/watchlist": {
      "get": {
        "summary": "GET /watchlist",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      }
    },
    "/watchlist/{movieId}": {
      "post": {
        "summary": "POST /watchlist/{movieId}",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          },
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      },
      "delete": {
        "summary": "DELETE /watchlist/{movieId}",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          },
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/movies/{movieId}/reviews": {
      "post": {
        "summary": "POST /movies/{movieId}/reviews",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          },
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "/movies/{movieId}/reviews/stats": {
      "get": {
        "summary": "GET /movies/{movieId}/reviews/stats",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "movieId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{24}$"
            }
          }
        ]
      }
    },
    "/support/requests": {
      "post": {
        "summary": "POST /support/requests",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        },
        "parameters": [
          {
            "name": "X-CSRF-Token",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Aynı cookie jar ile GET /auth/csrf yanıtından alınır."
          }
        ]
      }
    },
    "/admin/access-check": {
      "get": {
        "summary": "GET /admin/access-check",
        "responses": {
          "200": {
            "description": "İşlem tamamlandı; uç noktaya göre 201/202/204 de kullanılabilir."
          },
          "400": {
            "description": "Geçersiz istek"
          },
          "401": {
            "description": "Giriş gerekli"
          },
          "403": {
            "description": "Yetki veya CSRF reddi"
          }
        }
      }
    }
  }
};
