"use client";

import { useEffect, useState } from "react";

export const DESKTOP_UMAMI_URL = "https://cloud.umami.is/share/zR5sLt0rybss8vIr";
export const MOBILE_UMAMI_URL = "https://cloud.umami.is/share/yVcPuoZM5Pe4hkJy";

export default function AnalyticsUmami() {
	const [url, setUrl] = useState<string>(MOBILE_UMAMI_URL);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia("(min-width: 1024px)");
		const update = () => setUrl(mql.matches ? DESKTOP_UMAMI_URL : MOBILE_UMAMI_URL);
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	return (
		<iframe src={url} title="Umami Traffic Data" className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500" loading="lazy" />
	);
}
