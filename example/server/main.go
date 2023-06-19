package main

import (
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/api/rate-limit", func(c *fiber.Ctx) error {
		return c.Status(429).JSON(fiber.Map{
			"message": "You have reached the rate limit",
			"retryAfter": 5,
			"retryLimit": 3,
			"rateLimitRemaining": 20, 
			"rateLimitReset": 50,
		})
	})


	err := app.Listen(":8080")
	if err != nil {
		panic(err)
	}
}
