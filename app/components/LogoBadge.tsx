"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PROXIMITY = 150; // px — how close the mouse needs to be to trigger

export default function LogoBadge() {

  return (
    <div className="w-48 h-48 rounded-full overflow-hidden">
      <Image
        src="/logo.jpg"
        alt="LSSA logo"
        width={150}
        height={150}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
