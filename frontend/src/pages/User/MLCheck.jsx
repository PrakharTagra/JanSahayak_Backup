import { useState } from "react";

export default function MLTester() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Send image to backend
  const handleSubmit = async () => {
    if (!image) return alert("Please upload an image");

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);

      const response = await fetch("/api/v1/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🧠 ML Model Tester</h2>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <div style={styles.previewBox}>
          <img src={preview} alt="preview" style={styles.image} />
        </div>
      )}

      <button onClick={handleSubmit} style={styles.button}>
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {result && (
        <div style={styles.resultBox}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "sans-serif",
  },
  previewBox: {
    marginTop: "20px",
  },
  image: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "20px",
    textAlign: "left",
    background: "#f4f4f4",
    padding: "10px",
    borderRadius: "8px",
  },
};