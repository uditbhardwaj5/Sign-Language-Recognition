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
  const [targetLanguage, setTargetLanguage] = useState("EN");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);

  const requestRef = useRef();
  const translateAbortRef = useRef(null);
  const translateTimeoutRef = useRef(null);
  const lastTranslationRef = useRef({ text: "", lang: "" });

  const [detectedData, setDetectedData] = useState([]);

  const user = useSelector((state) => state.auth?.user);

  const { accessToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current);
      }
      if (translateAbortRef.current) {
        translateAbortRef.current.abort();
      }
    };
  }, []);

  const translateProxyUrl =
    process.env.REACT_APP_TRANSLATE_PROXY_URL || "/api/translate";

  const languageOptions = [
    { code: "EN", label: "English", supported: true },
    { code: "HI", label: "Hindi", supported: true },
    { code: "BN", label: "Bengali", supported: true },
    { code: "MR", label: "Marathi", supported: true },
    { code: "TA", label: "Tamil", supported: true },
    { code: "GU", label: "Gujarati", supported: true },
    { code: "TE", label: "Telugu", supported: true },
    { code: "UR", label: "Urdu", supported: true },
    { code: "SA", label: "Sanskrit", supported: true },
  ];

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

        const rawModelUrl =
          process.env.REACT_APP_MODEL_URL ||
          "/models/sign_language_recognizer.task";
        const modelAssetPath = new URL(rawModelUrl, window.location.origin)
          .toString();

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
          },
          numHands: 2,
          runningMode: runningMode,
        });

        setGestureRecognizer(recognizer);
      } catch (error) {
        setModelError("Failed to load gesture recognizer. Check model path.");
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load gesture recognizer:", error);
        }
      } finally {
        setIsModelLoading(false);
      }
    }
    loadGestureRecognizer();
  }, [runningMode]);

  useEffect(() => {
    if (!gestureOutput) {
      setTranslatedText("");
      setTranslateError(null);
      return;
    }

    if (targetLanguage === "EN") {
      setTranslatedText(gestureOutput);
      setTranslateError(null);
      return;
    }

    const lastTranslation = lastTranslationRef.current;
    if (
      lastTranslation.text === gestureOutput &&
      lastTranslation.lang === targetLanguage
    ) {
      return;
    }

    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current);
    }

    translateTimeoutRef.current = setTimeout(async () => {
      if (translateAbortRef.current) {
        translateAbortRef.current.abort();
      }

      const controller = new AbortController();
      translateAbortRef.current = controller;

      try {
        setIsTranslating(true);
        setTranslateError(null);

        const response = await fetch(translateProxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: gestureOutput,
            targetLang: targetLanguage,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const message = errorPayload?.error || "Translation unavailable.";
          throw new Error(message);
        }

        const payload = await response.json();
        const translated = payload?.translation || "";

        setTranslatedText(translated);
        lastTranslationRef.current = {
          text: gestureOutput,
          lang: targetLanguage,
        };
      } catch (error) {
        if (error.name !== "AbortError") {
          setTranslateError(error.message || "Translation unavailable.");
        }
      } finally {
        setIsTranslating(false);
      }
    }, 400);

    return () => {
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current);
      }
    };
  }, [gestureOutput, targetLanguage, translateProxyUrl]);

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
                    aria-label={webcamRunning ? "Stop webcam" : "Start webcam"}
                  >
                    {webcamRunning ? "Stop" : "Start"}
                  </button>
                  <div className="signlang_language-selector">
                    <label htmlFor="translate-language">Translate to:</label>
                    <div className="signlang_select-wrapper">
                      <select
                        id="translate-language"
                        value={targetLanguage}
                        onChange={(event) => setTargetLanguage(event.target.value)}
                        className="signlang_select"
                      >
                        {languageOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                            {option.supported ? "" : " (unsupported)"}
                          </option>
                        ))}
                      </select>
                      <span className="signlang_select-arrow">▼</span>
                    </div>
                  </div>
                </div>

                <div className="signlang_data">
                  {isModelLoading && (
                    <p className="gesture_output">
                      Loading model, please wait...
                    </p>
                  )}
                  {modelError && (
                    <p className="gesture_output" style={{ color: '#ff6b6b' }}>{modelError}</p>
                  )}
                  <p className="gesture_output">{gestureOutput}</p>

                  <div className="signlang_translation">
                    {translateError ? (
                      <p className="gesture_output signlang_translation-error">
                        {translateError}
                      </p>
                    ) : (
                      <p className="gesture_output">
                        {isTranslating
                          ? "Translating..."
                          : translatedText || "Translation will appear here"}
                      </p>
                    )}
                  </div>

                  {progress ? <ProgressBar progress={progress} /> : null}
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
