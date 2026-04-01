package crypto

import (
	"testing"
	"gin-minimal/models"
)

func TestHash(t *testing.T) {
	data := "test_data"
	hash := Hash(data)

	if len(hash) == 0 {
		t.Error("Expected non-empty hash")
	}

	// Same input should produce same hash
	hash2 := Hash(data)
	if hash != hash2 {
		t.Error("Expected same hash for same input")
	}

	// Different input should produce different hash
	hash3 := Hash("different_data")
	if hash == hash3 {
		t.Error("Expected different hash for different input")
	}
}

func TestGenerateKeyPair(t *testing.T) {
	privKey, pubKey, err := GenerateKeyPair()
	if err != nil {
		t.Fatalf("Failed to generate key pair: %v", err)
	}

	if len(privKey) == 0 {
		t.Error("Expected non-empty private key")
	}

	if len(pubKey) == 0 {
		t.Error("Expected non-empty public key")
	}

	// Public key should be longer (it has X and Y coordinates)
	if len(pubKey) != 132 {
		t.Errorf("Expected public key length 132, got %d", len(pubKey))
	}
}

func TestSignAndVerify(t *testing.T) {
	// Generate key pair
	privKey, pubKey, err := GenerateKeyPair()
	if err != nil {
		t.Fatalf("Failed to generate key pair: %v", err)
	}

	// Create test data
	testData := "test_transaction_data"
	txHash := Hash(testData)

	// Sign the hash
	signature, err := SignTransaction(privKey, txHash)
	if err != nil {
		t.Fatalf("Failed to sign transaction: %v", err)
	}

	if len(signature) == 0 {
		t.Error("Expected non-empty signature")
	}

	// Verify the signature
	isValid := VerifySignature(pubKey, signature, txHash)
	if !isValid {
		t.Error("Expected signature verification to pass")
	}

	// Verify with wrong hash should fail
	wrongHash := Hash("different_data")
	isValid = VerifySignature(pubKey, signature, wrongHash)
	if isValid {
		t.Error("Expected signature verification to fail with wrong hash")
	}
}

func TestBuildMerkleRoot(t *testing.T) {
	hashes := []string{
		Hash("txn_1"),
		Hash("txn_2"),
		Hash("txn_3"),
		Hash("txn_4"),
	}

	root := BuildMerkleRoot(hashes)
	if len(root) == 0 {
		t.Error("Expected non-empty merkle root")
	}

	// Same hashes should produce same root
	root2 := BuildMerkleRoot(hashes)
	if root != root2 {
		t.Error("Expected same merkle root for same hashes")
	}

	// Different hashes should produce different root
	differentHashes := []string{
		Hash("txn_1"),
		Hash("txn_2"),
		Hash("txn_3"),
		Hash("txn_5"), // Different
	}
	root3 := BuildMerkleRoot(differentHashes)
	if root == root3 {
		t.Error("Expected different merkle root for different hashes")
	}
}

func TestGenerateMerkleProof(t *testing.T) {
	hashes := []string{
		Hash("txn_1"),
		Hash("txn_2"),
		Hash("txn_3"),
		Hash("txn_4"),
	}

	targetHash := hashes[2]

	proof, err := GenerateMerkleProof(hashes, targetHash)
	if err != nil {
		t.Fatalf("Failed to generate merkle proof: %v", err)
	}

	if len(proof) == 0 {
		t.Error("Expected non-empty proof")
	}

	// Proof for non-existent hash should fail
	_, err = GenerateMerkleProof(hashes, Hash("non_existent"))
	if err == nil {
		t.Error("Expected error for non-existent hash")
	}
}

func TestVerifyTransactionSignature(t *testing.T) {
	privKey, pubKey, _ := GenerateKeyPair()
	txHash := Hash("test_transaction")

	signature, _ := SignTransaction(privKey, txHash)

	tx := &models.Transaction{
		Hash:      txHash,
		Signature: signature,
		PublicKey: pubKey,
	}

	isValid := VerifyTransactionSignature(tx)
	if !isValid {
		t.Error("Expected transaction signature verification to pass")
	}

	// Transaction with invalid signature should fail
	tx.Signature = Hash("invalid_signature")
	isValid = VerifyTransactionSignature(tx)
	if isValid {
		t.Error("Expected transaction signature verification to fail")
	}
}
