import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  RefreshCw,
  Clock,
  Copy,
  Check,
  Building2
} from 'lucide-react';

import dynamicQrApi from '../../api/dynamicQrApi';
import { useNotification } from '../../context/NotificationContext';

export const LiveQrDisplay = () => {

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(45);
  const [copied, setCopied] = useState(false);

  const { showToast } = useNotification();

  // ============================================================
  // FETCH ACTIVE QR
  // ============================================================

  const fetchQr = useCallback(async () => {

    try {

      setLoading(true);

      const res = await dynamicQrApi.getActiveQr();

      console.log("FULL QR API RESPONSE:", res);
      console.log("QR RESPONSE DATA:", res?.data);

      /*
       * Your backend appears to use:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {...}
       * }
       *
       * So support both:
       *
       * res.data.data
       *
       * and
       *
       * res.data
       */

      const data = res?.data?.data || res?.data;

      console.log("EXTRACTED QR DATA:", data);

      if (data) {

        setQrData(data);

        setCountdown(
          Number(data.expiresInSeconds) || 45
        );

      } else {

        console.error(
          "QR data is empty:",
          res
        );

        setQrData(null);
      }

    } catch (err) {

      console.error(
        "Failed to load active QR:",
        err
      );

      setQrData(null);

      showToast(
        'Failed to load office QR',
        'error'
      );

    } finally {

      setLoading(false);
    }

  }, [showToast]);


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    fetchQr();

  }, [fetchQr]);


  // ============================================================
  // COUNTDOWN
  // ============================================================

  useEffect(() => {

    const timer = setInterval(() => {

      setCountdown((prev) => {

        if (prev <= 1) {

          // Fetch a new QR
          fetchQr();

          return 45;
        }

        return prev - 1;
      });

    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [fetchQr]);


  // ============================================================
  // COPY QR TOKEN
  // ============================================================

  const handleCopy = async () => {

    if (!qrData?.qrToken) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        qrData.qrToken
      );

      setCopied(true);

      showToast(
        'QR Token copied to clipboard',
        'info'
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {

      console.error(
        'Failed to copy token:',
        error
      );

      showToast(
        'Failed to copy token',
        'error'
      );
    }
  };


  // ============================================================
  // QR IMAGE
  // ============================================================

  const getQrImageSrc = () => {

    if (!qrData?.qrCodeImageBase64) {
      return null;
    }

    const base64 = qrData.qrCodeImageBase64;

    /*
     * If backend already returns:
     *
     * data:image/png;base64,.....
     *
     * don't add the prefix again.
     */

    if (base64.startsWith('data:image')) {
      return base64;
    }

    /*
     * Otherwise assume plain Base64 PNG.
     */

    return `data:image/png;base64,${base64}`;
  };


  const qrImageSrc = getQrImageSrc();


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="space-y-2">

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Live Dynamic Office QR Kiosk
        </h1>

        <p className="text-xs text-slate-400">
          Mount this screen at reception/turnstile.
          Employees scan this rotating QR code to verify
          physical presence.
        </p>

      </div>


      {/* ======================================================
          MAIN CARD
      ======================================================= */}

      <div className="
        glass-panel
        rounded-3xl
        p-8
        border
        border-slate-800
        space-y-6
        relative
        overflow-hidden
      ">


        {/* ====================================================
            OFFICE NAME
        ===================================================== */}

        <div className="
          inline-flex
          items-center
          gap-2
          px-3.5
          py-1.5
          rounded-full
          bg-slate-900
          border
          border-slate-800
          text-xs
          text-sky-400
          font-semibold
        ">

          <Building2 className="w-4 h-4" />

          <span>
            {qrData?.officeName ||
              'Headquarters Tech Park'}
          </span>

        </div>


        {/* ====================================================
            QR CODE
        ===================================================== */}

        <div className="
          relative
          mx-auto
          w-72
          h-72
          rounded-3xl
          bg-white
          p-4
          shadow-2xl
          flex
          items-center
          justify-center
          border-4
          border-slate-800
        ">

          {loading ? (

            <RefreshCw
              className="
                w-10
                h-10
                text-slate-400
                animate-spin
              "
            />

          ) : qrImageSrc ? (

            <img
              src={qrImageSrc}
              alt="Dynamic Rotating Office QR"
              className="
                w-full
                h-full
                object-contain
              "
              onLoad={() => {
                console.log(
                  "QR IMAGE LOADED SUCCESSFULLY"
                );
              }}
              onError={(e) => {
                console.error(
                  "QR IMAGE FAILED TO LOAD",
                  e
                );
              }}
            />

          ) : (

            <div className="flex flex-col items-center gap-3">

              <QrCode
                className="
                  w-20
                  h-20
                  text-slate-300
                "
              />

              <p className="
                text-xs
                text-slate-400
              ">
                QR code not available
              </p>

            </div>
          )}

        </div>


        {/* ====================================================
            DEBUG INFORMATION
        ===================================================== */}

        {!loading && !qrImageSrc && (
          <div className="
            bg-red-950/40
            border
            border-red-800
            rounded-xl
            p-4
            text-left
          ">

            <p className="
              text-xs
              text-red-400
              font-bold
              mb-2
            ">
              QR DATA DEBUG
            </p>

            <pre className="
              text-[10px]
              text-red-300
              overflow-auto
              max-h-40
            ">
              {JSON.stringify(
                qrData,
                null,
                2
              )}
            </pre>

          </div>
        )}


        {/* ====================================================
            COUNTDOWN
        ===================================================== */}

        <div className="
          space-y-2
          max-w-xs
          mx-auto
        ">

          <div className="
            flex
            items-center
            justify-between
            text-xs
            text-slate-400
          ">

            <span className="
              flex
              items-center
              gap-1
            ">

              <Clock
                className="
                  w-3.5
                  h-3.5
                  text-sky-400
                "
              />

              <span>
                Rotates in:
              </span>

            </span>

            <span className="
              font-mono
              font-bold
              text-sky-400
            ">
              {countdown}s
            </span>

          </div>


          <div className="
            w-full
            h-1.5
            bg-slate-800
            rounded-full
            overflow-hidden
          ">

            <div
              className="
                h-full
                bg-gradient-to-r
                from-sky-500
                to-cyan-400
                transition-all
                duration-1000
                ease-linear
              "
              style={{
                width: `${Math.min(
                  Math.max(
                    (countdown / 45) * 100,
                    0
                  ),
                  100
                )}%`
              }}
            />

          </div>

        </div>


        {/* ====================================================
            TOKEN
        ===================================================== */}

        {qrData?.qrToken && (

          <div className="
            glass-card
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
            gap-3
            text-left
          ">

            <div className="overflow-hidden">

              <span className="
                text-[10px]
                uppercase
                font-bold
                text-slate-400
                block
                mb-0.5
              ">
                Cryptographic HMAC Nonce Token
              </span>

              <p className="
                text-[11px]
                font-mono
                text-slate-300
                truncate
                max-w-sm
              ">
                {qrData.qrToken}
              </p>

            </div>


            <button
              onClick={handleCopy}
              className="
                p-2.5
                rounded-xl
                bg-slate-800
                hover:bg-slate-700
                text-slate-200
                transition
                flex-shrink-0
              "
              title="Copy token for manual check-in testing"
            >

              {copied ? (

                <Check
                  className="
                    w-4
                    h-4
                    text-emerald-400
                  "
                />

              ) : (

                <Copy
                  className="w-4 h-4"
                />

              )}

            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default LiveQrDisplay;