import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Image, Button } from "react-native";

import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { fetch, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as jpeg from "jpeg-js";
const image = require("./assets/4.png");

export default function App() {
  const [url, setUrl] = useState(
    "https://oceana.org/sites/default/files/styles/lightbox/public/_31.jpg"
  );
  const [displayText, setDisplayText] = useState("loading");

  async function getPrediction(url) {
    await tf.ready(); // ready tf
    setDisplayText("Loading MobileNet");
    const model = await mobilenet.load(); //load mobilenet : neural network designed to classify image into different categories
    setDisplayText("Fetching Image");
    // const imageAssetPath = Image.resolveAssetSource(image);
    const response = await fetch(url, {}, { isBinary: true }); //fetches image with binary section of that image
    // console.log(imageAssetPath.uri);
    setDisplayText("Getting Image Buffer");
    const imageData = await response.arrayBuffer(); // image gonna be binary, so we need to represent it as byte  array
    const newData = new Uint8Array(imageData);
    setDisplayText("Getting Image Tensor");
    const imageTensor = decodeJpeg(newData); // transforms byte array into 3d tensor
    setDisplayText("Getting Classification results");
    const prediction = await model.classify(imageTensor);
    setDisplayText(JSON.stringify(prediction));
  }
  // function imageToTensor(rawData) {
  //   const { width, height, data } = jpeg.decode(rawData, true);
  //   const buffer = new Uint8Array(width * height * 3);
  //   let offset = 0;
  //   for (let i = 0; i < buffer.length; i += 3) {
  //     buffer[i] = data[offset]; //red
  //     buffer[i + 1] = data[offset + 1]; //green
  //     buffer[i + 2] = data[offset + 2]; //blue
  //     offset += 4; // skips alpha value
  //   }
  //   return tf.tensor3d(buffer, [height, width, 3]);
  // }

  return (
    <View style={styles.container}>
      <Text>Image Classifier</Text>
      <TextInput
        style={{
          height: 40,
          width: "90%",
          borderColor: "grey",
          borderWidth: 1,
        }}
        value={url}
        onChangeText={(text) => setUrl(text)}
      />
      <Image
        source={{ uri: url }}
        style={{ height: 200, width: 200, resizeMode: "contain" }}
      />
      <Button onPress={() => getPrediction(url)} title="Classify Image" />
      <Text>{displayText}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
