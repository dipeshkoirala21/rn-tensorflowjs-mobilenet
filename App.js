import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { fetch, decodeJpeg } from "@tensorflow/tfjs-react-native";

import * as jpeg from "jpeg-js";

import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
const image = require("./assets/4.png");

export default function App() {
  const [url, setUrl] = useState(
    "https://oceana.org/sites/default/files/styles/lightbox_full/public/shutterstock_11414779.jpg"
  );
  const [displayText, setDisplayText] = useState("loading");

  getPrediction = async () => {
    console.log(url, "url hy ta yo chai");
    await tf.ready(); // ready tf
    setDisplayText("Loading MobileNet");
    const model = await mobilenet.load(); //load mobilenet : neural network designed to classify image into different categories
    setDisplayText("Fetching Image");
    const fileUri = url;
    const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
    // const imageAssetPath = Image.resolveAssetSource(url);
    // // console.log(imageAssetPath, "hello");
    // const response = await fetch(imageAssetPath.uri, {}, { isBinary: true }); //fetches image with binary section of that image
    // console.log(imageAssetPath.uri);
    setDisplayText("Getting Image Buffer");
    // const imageData = await response.arrayBuffer(); // image gonna be binary, so we need to represent it as byte  array
    const newData = new Uint8Array(imgBuffer);
    setDisplayText("Getting Image Tensor");
    const imageTensor = decodeJpeg(newData); // transforms byte array into 3d tensor
    setDisplayText("Getting Classification results");
    const prediction = await model.classify(imageTensor);
    setDisplayText(JSON.stringify(prediction));
  };
  selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!response.cancelled) {
        // const source = { uri: response.uri };
        setUrl(response.uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
      {/* <TextInput
        style={{
          height: 40,
          width: "90%",
          borderColor: "grey",
          borderWidth: 1,
        }}
        value={url}
        onChangeText={(text) => setUrl(text)}
      />
       */}
      <TouchableOpacity
        onPress={() => selectImage()}
        style={{ height: 300, width: 300, backgroundColor: "lightgrey" }}
      >
        <Image
          source={{ uri: url }}
          style={{
            height: undefined,
            width: undefined,
            resizeMode: "cover",
            flex: 1,
          }}
        />
      </TouchableOpacity>
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
