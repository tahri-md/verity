package main

import (
	"database/sql"
	"gin-minimal/config"
	"gin-minimal/models"
	"gin-minimal/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var db *sql.DB

func main() {

	godotenv.Load()
	db, err := config.InitDB()
	if err != nil {
		panic(err)
	}
	db.AutoMigrate(
		&models.Transaction{},
		&models.Account{},
		&models.Block{},
	)
	router := gin.Default()
	routes.RegisterTransactionRoutes(router, db)
	routes.RegisterAccountRoutes(router, db)
	routes.RegisterBlockRoutes(router, db)
	router.Run(":8080")
	// r.GET("/hello", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "hello world",
	// 	})
	// })
	// r.GET("/users", func(c *gin.Context) {
	// 	rows, err := db.Query("SELECT id,name FROM USERS")
	// 	if err != nil {
	// 		c.JSON(500, gin.H{
	// 			"error": err.Error(),
	// 		})
	// 		return
	// 	}
	// 	defer rows.Close()
	// 	users := []User{}
	// 	for rows.Next() {
	// 		var user User
	// 		if err := rows.Scan(&user.ID, &user.Name); err != nil {
	// 			c.JSON(500, gin.H{
	// 				"error": err.Error(),
	// 			})
	// 			return
	// 		}
	// 		users = append(users, user)
	// 	}
	// 	c.JSON(200, gin.H{
	// 		"users": users,
	// 	})

	// })
	// r.POST("/users", createUser)
	router.Run(":8080")

}

// func createUser(c *gin.Context) {
// 	var u User

// 	if err := c.ShouldBindJSON(&u); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	err := db.QueryRow(
// 		"INSERT INTO users (name) VALUES ($1) RETURNING id",
// 		u.Name,
// 	).Scan(&u.ID)

// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, u)
// }
