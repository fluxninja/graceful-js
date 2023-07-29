package main

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/api/rate-limit", func(c *fiber.Ctx) error {
		return c.Status(429).JSON(fiber.Map{
			"message": "You have reached the rate limit",
			"retryAfter": 5,
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

	app.Get("/api/wait-room", func(c *fiber.Ctx) error {
		delaySeconds := 25

		// Introduce the delay
		time.Sleep(time.Duration(delaySeconds) * time.Second)

		return c.Status(200).JSON(fiber.Map{
			"message": "You have entered app successfully",
		})
	})


	err := app.Listen(":8098")
	if err != nil {
		panic(err)
	}
}
