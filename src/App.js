import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { useState, useEffect } from "react";
import { Upload } from "@aws-sdk/lib-storage";

require("dotenv").config();

console.log(process.env);

const Bucket = process.env.REACT_APP_BUCKET;
const client = new S3Client({
  region: process.env.REACT_APP_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  },
});

function App() {
  const [contents, setContents] = useState();
  useEffect(() => {
    client.send(new ListObjectsV2Command({ Bucket })).then((response) => {
      if (response.$metadata.httpStatusCode === 200) {
        setContents(response.Contents);
      }
    });
  }, []);

  async function handleFileChange(e) {
    const [file] = Array.from(e.target.files);

    const target = { Bucket, Key: file.name, Body: file };
    try {
      const paralellUploads3 = new Upload({
        client,
        params: target,
      });

      paralellUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });

      await paralellUploads3.done();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <pre>{contents ? JSON.stringify(contents, null, 2) : "Loading..."}</pre>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}

export default App;
