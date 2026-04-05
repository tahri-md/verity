package routes

import (
	"net/http"
	"strings"

	"gin-minimal/internal/crypto"
	"gin-minimal/models"

	"github.com/gin-gonic/gin"
)

func RegisterCryptoRoutes(router *gin.Engine) {
	// Verify ECDSA signature against a hash.
	// - If `hash` looks like a 64-hex sha256 digest, it will be used directly.
	// - Otherwise, the server hashes the provided `message` (sha256) and verifies against that.
	router.POST("/api/crypto/verify-signature", func(c *gin.Context) {
		var req struct {
			Message   string `json:"message"`
			Hash      string `json:"hash"`
			Signature string `json:"signature" binding:"required"`
			PublicKey string `json:"publicKey"`
			PubKey    string `json:"public_key"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"valid": false, "message": err.Error()})
			return
		}

		pub := req.PubKey
		if pub == "" {
			pub = req.PublicKey
		}

		hashHex := strings.TrimSpace(req.Hash)
		if hashHex == "" {
			hashHex = strings.TrimSpace(req.Message)
		}

		// If it doesn't look like a sha256 hex digest, hash it.
		if len(hashHex) != 64 || strings.ContainsAny(hashHex, "ghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ") {
			hashHex = crypto.Hash(hashHex)
		}

		valid := crypto.VerifySignature(pub, req.Signature, hashHex)
		c.JSON(http.StatusOK, gin.H{
			"valid":   valid,
			"message": map[bool]string{true: "signature is valid", false: "signature is invalid"}[valid],
		})
	})

	// Verify a Merkle proof.
	router.POST("/api/crypto/verify-merkle", func(c *gin.Context) {
		var req struct {
			TxHash     string            `json:"transactionHash"`
			MerkleRoot string            `json:"merkleRoot"`
			Proof      []models.ProofNode `json:"proof"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"valid": false, "message": err.Error()})
			return
		}

		valid := crypto.VerifyMerkleProof(req.TxHash, req.Proof, req.MerkleRoot)
		c.JSON(http.StatusOK, gin.H{
			"valid":   valid,
			"message": map[bool]string{true: "proof is valid", false: "proof is invalid"}[valid],
		})
	})
}
