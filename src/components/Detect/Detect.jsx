import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import {
  drawConnectors,
  drawLandmarks,
  // HAND_CONNECTIONS,
} from "@mediapipe/drawing_utils";

import { HAND_CONNECTIONS } from "@mediapipe/hands";

import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";

import DisplayImg from "../../assests/displayGif.gif";
import { FaChevronDown } from "react-icons/fa";

let startTime = "";

const Detect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureOutput, setGestureOutput] = useState("");
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("ASL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const requestRef = useRef();

  const [detectedData, setDetectedData] = useState([]);

  const user = useSelector((state) => state.auth?.user);

  const { accessToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const languages = [
    { code: "ASL", name: "American Sign Language", targetLang: "en" },
    { code: "HSL", name: "Hindi Sign Language", targetLang: "hi" },
    { code: "BSF", name: "Bengali Sign Language", targetLang: "bn" },
    { code: "MGS", name: "Marathi Sign Language", targetLang: "mr" },
    { code: "TSL", name: "Tamil Sign Language", targetLang: "ta" },
  ];

  const getTargetLanguage = () => {
    const selected = languages.find((lang) => lang.code === selectedLanguage);
    return selected?.targetLang || "en";
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "production"
  ) {
    console.log = function () {};
  }

  const predictWebcam = useCallback(() => {
    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(
      webcamRef.current.video,
      nowInMs
    );

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Draw the results on the canvas, if any.
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });

        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    if (results.gestures.length > 0) {
      setDetectedData((prevData) => [
        ...prevData,
        {
          SignDetected: results.gestures[0][0].categoryName,
        },
      ]);

      setGestureOutput(results.gestures[0][0].categoryName);
      setProgress(Math.round(parseFloat(results.gestures[0][0].score) * 100));
    } else {
      setGestureOutput("");
      setProgress("");
    }

    if (webcamRunning === true) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [webcamRunning, runningMode, gestureRecognizer, setGestureOutput]);

  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate);
    predictWebcam();
  }, [predictWebcam]);

  const enableCam = useCallback(() => {
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    if (webcamRunning === true) {
      setWebcamRunning(false);
      cancelAnimationFrame(requestRef.current);

      const endTime = new Date();

      const timeElapsed = (
        (endTime.getTime() - startTime.getTime()) /
        1000
      ).toFixed(2);

      // Remove empty values
      const nonEmptyData = detectedData.filter(
        (data) => data.SignDetected !== "" && data.DetectedScore !== ""
      );

      //to filter continous same signs in an array
      const resultArray = [];
      let current = nonEmptyData[0];

      for (let i = 1; i < nonEmptyData.length; i++) {
        if (nonEmptyData[i].SignDetected !== current.SignDetected) {
          resultArray.push(current);
          current = nonEmptyData[i];
        }
      }

      resultArray.push(current);

      //calculate count for each repeated sign
      const countMap = new Map();

      for (const item of resultArray) {
        const count = countMap.get(item.SignDetected) || 0;
        countMap.set(item.SignDetected, count + 1);
      }

      const sortedArray = Array.from(countMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      const outputArray = sortedArray
        .slice(0, 5)
        .map(([sign, count]) => ({ SignDetected: sign, count }));

      // object to send to action creator
      const data = {
        signsPerformed: outputArray,
        id: uuidv4(),
        username: user?.name,
        userId: user?.userId,
        createdAt: String(endTime),
        secondsSpent: Number(timeElapsed),
      };

      dispatch(addSignData(data));
      setDetectedData([]);
    } else {
      setWebcamRunning(true);
      startTime = new Date();
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [
    webcamRunning,
    gestureRecognizer,
    animate,
    detectedData,
    user?.name,
    user?.userId,
    dispatch,
  ]);

  useEffect(() => {
    async function loadGestureRecognizer() {
      try {
        setIsModelLoading(true);
        setModelError(null);

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: process.env.REACT_APP_MODEL_URL,
          },
          numHands: 2,
          runningMode: runningMode,
        });

        setGestureRecognizer(recognizer);
      } catch (error) {
        console.error("Failed to load gesture recognizer:", error);
        setModelError("Failed to load gesture recognizer. Check model path.");
      } finally {
        setIsModelLoading(false);
      }
    }
    loadGestureRecognizer();
  }, [runningMode]);

  useEffect(() => {
    if (!gestureOutput) {
      setTranslatedText("");
      return;
    }

    const controller = new AbortController();

    const translateText = async () => {
      try {
        setIsTranslating(true);
        setTranslationError(null);

        const target = getTargetLanguage();

        const apiUrl =
          process.env.REACT_APP_TRANSLATE_API_URL ||
          "https://libretranslate.com/translate";
        const apiKey = process.env.REACT_APP_TRANSLATE_API_KEY;

        const payload = {
          q: gestureOutput,
          source: "auto",
          target,
          format: "text",
        };

        if (apiKey) {
          payload.api_key = apiKey;
        }

        const response = await fetch(
          apiUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

        if (!response.ok) {
          throw new Error("Translation request failed");
        }

        const data = await response.json();
        setTranslatedText(data.translatedText || data.translation || "");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Translation error:", error);
        setTranslationError("Failed to translate text.");
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();

    return () => controller.abort();
  }, [gestureOutput, selectedLanguage]);

  return (
    <>
      <div className="signlang_detection-container">
        {accessToken ? (
          <>
            <div style={{ position: "relative" }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                // screenshotFormat="image/jpeg"
                className="signlang_webcam"
              />

              <canvas ref={canvasRef} className="signlang_canvas" />

              <div className="signlang_data-container">
                <div className="signlang_controls-wrapper">
                  <button
                    onClick={enableCam}
                    disabled={isModelLoading || !!modelError}
                  >
                    {webcamRunning ? "Stop" : "Start"}
                  </button>
                  
                  <div className="signlang_language-dropdown" ref={dropdownRef}>
                    <button
                      className="signlang_language-dropdown-button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{selectedLanguage}</span>
                      <FaChevronDown
                        className={`signlang_dropdown-icon ${
                          isDropdownOpen ? "open" : ""
                        }`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="signlang_language-dropdown-menu">
                        {languages.map((lang) => (
                          <div
                            key={lang.code}
                            className={`signlang_language-dropdown-item ${
                              selectedLanguage === lang.code ? "active" : ""
                            }`}
                            onClick={() => {
                              setSelectedLanguage(lang.code);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="signlang_language-code">
                              {lang.code}
                            </span>
                            <span className="signlang_language-name">
                              {lang.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="signlang_data">
                  {isModelLoading && (
                    <p className="gesture_status-text">
                      Loading model, please wait...
                    </p>
                  )}
                  {modelError && (
                    <p className="gesture_status-text error">{modelError}</p>
                  )}
                  <p className="gesture_output">{gestureOutput}</p>

                  {progress ? <ProgressBar progress={progress} /> : null}
                  {isTranslating && !translationError && (
                    <p className="gesture_status-text">Translating...</p>
                  )}
                  {translationError && (
                    <p className="gesture_status-text error">
                      {translationError}
                    </p>
                  )}
                  {translatedText && (
                    <p className="gesture_translation">{translatedText}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : 
        (
          <div className="signlang_detection_notLoggedIn">

             <h1 className="gradient__text">Please Login !</h1>
             <img src={DisplayImg} alt="diplay-img"/>
             <p>
              We Save Your Detection Data to show your progress and learning in dashboard, So please Login to Test this Detection Feature.
             </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Detect;
