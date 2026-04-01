package middleware

import (
	"gin-minimal/errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorMiddleware handles errors and returns proper JSON responses
func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there's an error in the context
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			log.Printf("Error occurred: %v", err)

			if appErr, ok := err.(*errors.AppError); ok {
				c.JSON(appErr.StatusCode, gin.H{
					"error": gin.H{
						"type":    string(appErr.Type),
						"message": appErr.Message,
						"details": appErr.Details,
					},
				})
			} else {
				appErr := errors.NewInternalError("An error occurred", err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": gin.H{
						"type":    string(appErr.Type),
						"message": appErr.Message,
						"details": appErr.Details,
					},
				})
			}
		}
	}
}
