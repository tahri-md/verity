package crypto

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"gin-minimal/models"
	"math/big"
	"strconv"
)

func Hash(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
func HashTransaction(tx models.Transaction) string {
	data := tx.FromAccount + tx.ToAccount + strconv.FormatInt(tx.Amount, 10)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func BuildMerkleRoot(hashes []string) string {
	if len(hashes) == 0 {
		return ""
	}

	for len(hashes) > 1 {
		var newLevel []string

		for i := 0; i < len(hashes); i += 2 {
			if i+1 < len(hashes) {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i+1]))
			} else {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i]))
			}
		}

		hashes = newLevel
	}

	return hashes[0]
}

func GenerateMerkleProof(hashes []string, target string) ([]string, error) {
	var proof []string

	index := -1
	for i, h := range hashes {
		if h == target {
			index = i
			break
		}
	}
	if index == -1 {
		return nil, errors.New("transaction not found in block")
	}

	for len(hashes) > 1 {
		if index%2 == 0 {
			if index+1 < len(hashes) {
				proof = append(proof, hashes[index+1])
			}
		} else {
			proof = append(proof, hashes[index-1])
		}

		var newLevel []string
		for i := 0; i < len(hashes); i += 2 {
			if i+1 < len(hashes) {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i+1]))
			} else {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i]))
			}
		}

		index = index / 2
		hashes = newLevel
	}

	return proof, nil
}

func GenerateMerkleProofNodes(hashes []string, target string) ([]models.ProofNode, error) {
	var proof []models.ProofNode

	index := -1
	for i, h := range hashes {
		if h == target {
			index = i
			break
		}
	}
	if index == -1 {
		return nil, errors.New("transaction not found in block")
	}

	for len(hashes) > 1 {
		if index%2 == 0 {
			// current is left; sibling on the right (or duplicated if missing)
			siblingIndex := index + 1
			if siblingIndex >= len(hashes) {
				siblingIndex = index
			}
			proof = append(proof, models.ProofNode{Hash: hashes[siblingIndex], Position: "right"})
		} else {
			// current is right; sibling on the left
			proof = append(proof, models.ProofNode{Hash: hashes[index-1], Position: "left"})
		}

		var newLevel []string
		for i := 0; i < len(hashes); i += 2 {
			if i+1 < len(hashes) {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i+1]))
			} else {
				newLevel = append(newLevel, Hash(hashes[i]+hashes[i]))
			}
		}

		index = index / 2
		hashes = newLevel
	}

	return proof, nil
}

func VerifySignature(pubKeyHex, sigHex, hashHex string) bool {

	pubBytes, err := hex.DecodeString(pubKeyHex)
	if err != nil {
		return false
	}

	sigBytes, err := hex.DecodeString(sigHex)
	if err != nil {
		return false
	}

	hashBytes, err := hex.DecodeString(hashHex)
	if err != nil {
		return false
	}

	x, y := elliptic.Unmarshal(elliptic.P256(), pubBytes)
	if x == nil {
		return false
	}

	pubKey := ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     x,
		Y:     y,
	}

	r := new(big.Int).SetBytes(sigBytes[:len(sigBytes)/2])
	s := new(big.Int).SetBytes(sigBytes[len(sigBytes)/2:])

	return ecdsa.Verify(&pubKey, hashBytes, r, s)
}

func VerifyMerkleProof(txHash string, proof []models.ProofNode, root string) bool {

	computed := txHash

	for _, p := range proof {

		if p.Position == "left" {
			computed = Hash(p.Hash + computed)
		} else {
			computed = Hash(computed + p.Hash)
		}
	}

	return computed == root
}

// GenerateKeyPair generates a new ECDSA key pair for signing transactions
func GenerateKeyPair() (*ecdsa.PrivateKey, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}
	return privateKey, nil
}

// GetPublicKeyHex returns the hex-encoded public key from a private key
func GetPublicKeyHex(privateKey *ecdsa.PrivateKey) string {
	pubKeyBytes := elliptic.Marshal(elliptic.P256(), privateKey.PublicKey.X, privateKey.PublicKey.Y)
	return hex.EncodeToString(pubKeyBytes)
}

// SignTransaction signs a transaction hash with the given private key
func SignTransaction(privateKey *ecdsa.PrivateKey, txHash string) (string, error) {
	hashBytes, err := hex.DecodeString(txHash)
	if err != nil {
		return "", err
	}

	r, s, err := ecdsa.Sign(rand.Reader, privateKey, hashBytes)
	if err != nil {
		return "", err
	}

	// Concatenate r and s to create signature
	rBytes := r.Bytes()
	sBytes := s.Bytes()

	// Pad to 32 bytes each if necessary
	if len(rBytes) < 32 {
		rBytes = append(make([]byte, 32-len(rBytes)), rBytes...)
	}
	if len(sBytes) < 32 {
		sBytes = append(make([]byte, 32-len(sBytes)), sBytes...)
	}

	sigBytes := append(rBytes, sBytes...)
	return hex.EncodeToString(sigBytes), nil
}

// VerifyTransactionSignature verifies a transaction signature
func VerifyTransactionSignature(tx *models.Transaction) bool {
	if tx == nil {
		return false
	}
	if tx.Hash == "" || tx.Signature == "" || tx.PublicKey == "" {
		return false
	}

	// Ensure the stored hash matches the canonical transaction hash.
	// (This matches HashTransaction and VerifyTransactionExternally.)
	if HashTransaction(*tx) != tx.Hash {
		return false
	}

	return VerifySignature(tx.PublicKey, tx.Signature, tx.Hash)
}
