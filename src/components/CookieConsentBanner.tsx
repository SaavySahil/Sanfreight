"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import styles from "./CookieConsentBanner.module.css";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "sanfreight-cookie-preferences";
const COOKIE_NAME = "SanFreightCookiePreferences";
const CHANGE_EVENT = "sanfreight-cookie-preferences-change";
const LOADING_SNAPSHOT = "loading";
const EMPTY_SNAPSHOT = "none";
const EMPTY_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};
const CLOUDFLARE_WEB_ANALYTICS_TOKEN = "05108d1f8cbd4a5daa7fa31fcb854888";
const CLOUDFLARE_WEB_ANALYTICS_CONFIG = JSON.stringify({
  token: CLOUDFLARE_WEB_ANALYTICS_TOKEN,
});

function subscribeToPreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getPreferencesSnapshot() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    // Fall back to the first-party cookie if local storage is unavailable or invalid.
  }

  try {
    const cookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${COOKIE_NAME}=`))
      ?.slice(COOKIE_NAME.length + 1);
    if (cookie) return decodeURIComponent(cookie);
  } catch {
    // An invalid cookie is treated as no saved choice.
  }

  return EMPTY_SNAPSHOT;
}

function getFooterTarget() {
  return (
    document.querySelector<HTMLElement>("#footer .bottom .right .links") ??
    document.querySelector<HTMLElement>("#footer .bottom .right") ??
    document.querySelector<HTMLElement>("#footer .bottom")
  );
}

function parsePreferences(snapshot: string): CookiePreferences | null {
  if (snapshot === EMPTY_SNAPSHOT || snapshot === LOADING_SNAPSHOT) return null;
  try {
    const parsed = JSON.parse(snapshot) as Partial<CookiePreferences>;
    if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
      return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing };
    }
  } catch {
    // An invalid saved value is treated as no choice.
  }
  return null;
}

function savePreferences(preferences: CookiePreferences) {
  const value = JSON.stringify(preferences);
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Keep the choice in a first-party cookie when local storage is unavailable.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.arrow}>
      <path d="M4 10h11M10 5l5 5-5 5" />
    </svg>
  );
}

export default function CookieConsentBanner() {
  const [preferenceSnapshot, setPreferenceSnapshot] = useState(LOADING_SNAPSHOT);
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);
  const preferences = parsePreferences(preferenceSnapshot) ?? EMPTY_PREFERENCES;
  const ready = preferenceSnapshot !== LOADING_SNAPSHOT;
  const [dismissed, setDismissed] = useState(false);
  const [draft, setDraft] = useState<CookiePreferences>(EMPTY_PREFERENCES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousAnalyticsChoice = useRef<boolean | null>(null);
  const bannerVisible = ready && !parsePreferences(preferenceSnapshot) && !dismissed;

  useEffect(() => {
    const refresh = () => setPreferenceSnapshot(getPreferencesSnapshot());
    refresh();
    return subscribeToPreferences(refresh);
  }, []);

  useEffect(() => {
    const refreshFooter = () => setFooterTarget(getFooterTarget());
    refreshFooter();

    const observer = new MutationObserver(refreshFooter);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (dialogOpen && !dialog.open) dialog.showModal();
    if (!dialogOpen && dialog.open) dialog.close();
  }, [dialogOpen]);

  useEffect(() => {
    if (!ready) return;

    const previouslyAllowed = previousAnalyticsChoice.current;
    previousAnalyticsChoice.current = preferences.analytics;

    // The analytics beacon patches browser navigation APIs after it loads.
    // Reload after revocation to end that runtime as well as stop future loads.
    if (previouslyAllowed && !preferences.analytics) window.location.reload();
  }, [ready, preferences.analytics]);

  function saveChoice(choice: CookiePreferences) {
    savePreferences(choice);
    setDialogOpen(false);
  }

  function openPreferences() {
    setDraft(preferences);
    setDialogOpen(true);
  }

  if (!ready) return null;

  return (
    <>
      {preferences.analytics ? (
        <Script
          id="sanfreight-cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          type="module"
          data-cf-beacon={CLOUDFLARE_WEB_ANALYTICS_CONFIG}
          strategy="afterInteractive"
        />
      ) : null}

      {bannerVisible ? (
        <section className={styles.banner} aria-label="Cookie preferences">
          <button
            className={styles.close}
            type="button"
            aria-label="Close cookie message"
            onClick={() => setDismissed(true)}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className={styles.bannerContent}>
            <p className={styles.message}>
              SanFreight Logistics uses cookies and similar technologies for essential site
              functions. With your consent, optional cookies can also help measure how the website
              is used and support relevant communications. You can give, refuse, or withdraw your
              consent at any time through Cookie settings. Choose Accept to allow all cookies, Reject
              to continue with essential cookies only, or Learn more and personalize to manage each
              category.
            </p>

            <button className={styles.personalize} type="button" onClick={openPreferences}>
              Learn more and personalize
            </button>

            <div className={styles.actions}>
              <button
                className={styles.choiceButton}
                type="button"
                onClick={() => saveChoice(EMPTY_PREFERENCES)}
              >
                <span>Reject</span>
                <Arrow />
              </button>
              <button
                className={styles.choiceButton}
                type="button"
                onClick={() => saveChoice({ necessary: true, analytics: true, marketing: true })}
              >
                <span>Accept</span>
                <Arrow />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {ready && !bannerVisible && footerTarget
        ? createPortal(
            <button className={styles.footerPreference} type="button" onClick={openPreferences}>
              Cookie settings
            </button>,
            footerTarget,
          )
        : null}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-description"
        onCancel={(event) => {
          event.preventDefault();
          setDialogOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setDialogOpen(false);
        }}
      >
        <div className={styles.dialogHeader}>
          <div>
            <p className={styles.eyebrow}>SANFREIGHT LOGISTICS</p>
            <h2 id="cookie-dialog-title">Cookie preferences</h2>
          </div>
          <button
            className={styles.dialogClose}
            type="button"
            aria-label="Close cookie preferences"
            onClick={() => setDialogOpen(false)}
          >
            ×
          </button>
        </div>
        <p id="cookie-dialog-description" className={styles.dialogDescription}>
          Choose which optional cookies you allow. Necessary cookies are always on so the site can
          work properly. You can change these choices at any time.
        </p>

        <div className={styles.preferenceList}>
          <div className={styles.preferenceRow}>
            <div>
              <h3>Necessary</h3>
              <p>Required for core site features and security.</p>
            </div>
            <span className={styles.alwaysOn}>Always on</span>
          </div>
          <label className={styles.preferenceRow}>
            <span>
              <span className={styles.preferenceTitle}>Analytics</span>
              <span className={styles.preferenceDescription}>
                Help us understand how visitors use the site.
              </span>
            </span>
            <input
              className={styles.toggle}
              type="checkbox"
              checked={draft.analytics}
              onChange={(event) => setDraft((current) => ({ ...current, analytics: event.target.checked }))}
              aria-label="Allow analytics cookies"
            />
          </label>
          <label className={styles.preferenceRow}>
            <span>
              <span className={styles.preferenceTitle}>Marketing</span>
              <span className={styles.preferenceDescription}>
                Support relevant communications and campaigns.
              </span>
            </span>
            <input
              className={styles.toggle}
              type="checkbox"
              checked={draft.marketing}
              onChange={(event) => setDraft((current) => ({ ...current, marketing: event.target.checked }))}
              aria-label="Allow marketing cookies"
            />
          </label>
        </div>

        <div className={styles.dialogActions}>
          <button className={styles.dialogSecondary} type="button" onClick={() => saveChoice(EMPTY_PREFERENCES)}>
            Reject optional
          </button>
          <button className={styles.dialogPrimary} type="button" onClick={() => saveChoice(draft)}>
            Save my choices
            <Arrow />
          </button>
        </div>
      </dialog>
    </>
  );
}
