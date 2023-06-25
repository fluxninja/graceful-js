package main

import (
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/api/rate-limit", func(c *fiber.Ctx) error {
		return c.Status(429).JSON(fiber.Map{
			"message": "You have reached the rate limit",
			// "retryAfter": 5,
			"retryLimit": 4,
			"rateLimitRemaining": 20, 
			"rateLimitReset": 50,
		})
	})

	app.Get("/api/ping", func(c *fiber.Ctx) error {
		return c.Status(422).JSON(fiber.Map{
			"message": "pong",
		})
	})


	err := app.Listen(":8098")
	if err != nil {
		panic(err)
	}
}
