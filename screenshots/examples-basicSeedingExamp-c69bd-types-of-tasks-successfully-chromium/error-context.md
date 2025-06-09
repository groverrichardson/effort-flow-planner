# Test info

- Name: Basic task seeding example >> should create different types of tasks successfully
- Location: /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/basicSeedingExample.spec.ts:31:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Test Task"
Received string:    "<!DOCTYPE html><html lang=\"en\" class=\"light\"><head>
    <script type=\"module\">import { injectIntoGlobalHook } from \"/@react-refresh\";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;</script>·
    <script type=\"module\" src=\"/@vite/client\"></script>·
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Task Manager</title>
    <meta name=\"description\" content=\"A powerful task management application\">
    <meta name=\"author\" content=\"Task Manager\">·
    <meta property=\"og:title\" content=\"Task Manager\">
    <meta property=\"og:description\" content=\"A powerful task management application\">
    <meta property=\"og:type\" content=\"website\">
    <meta property=\"og:image\" content=\"https://lovable.dev/opengraph-image-p98pqg.png\">·
    <meta name=\"twitter:card\" content=\"summary_large_image\">
    <meta name=\"twitter:site\" content=\"@lovable_dev\">
    <meta name=\"twitter:image\" content=\"https://lovable.dev/opengraph-image-p98pqg.png\">
    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin=\"\">
    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@100..900&amp;display=swap\" rel=\"stylesheet\">
  <style type=\"text/css\">:where(html[dir=\"ltr\"]),:where([data-sonner-toaster][dir=\"ltr\"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir=\"rtl\"]),:where([data-sonner-toaster][dir=\"rtl\"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted=\"true\"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted=\"true\"]){transform:none}}:where([data-sonner-toaster][data-x-position=\"right\"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position=\"left\"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position=\"center\"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position=\"top\"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position=\"bottom\"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled=\"true\"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position=\"top\"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position=\"bottom\"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise=\"true\"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme=\"dark\"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled=\"true\"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping=\"true\"]):before{content:\"\";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position=\"top\"][data-swiping=\"true\"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position=\"bottom\"][data-swiping=\"true\"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping=\"false\"][data-removed=\"true\"]):before{content:\"\";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:\"\";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted=\"true\"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded=\"false\"][data-front=\"false\"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded=\"false\"][data-front=\"false\"][data-styled=\"true\"])>*{opacity:0}:where([data-sonner-toast][data-visible=\"false\"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted=\"true\"][data-expanded=\"true\"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed=\"true\"][data-front=\"true\"][data-swipe-out=\"false\"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed=\"true\"][data-front=\"false\"][data-swipe-out=\"false\"][data-expanded=\"true\"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed=\"true\"][data-front=\"false\"][data-swipe-out=\"false\"][data-expanded=\"false\"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed=\"true\"][data-front=\"false\"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
</style><style type=\"text/css\" data-vite-dev-id=\"/Users/freedommarketing/Desktop/effort-flow-planner/src/index.css\">*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}·
::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}/*
! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com
*//*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/·
*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e5e7eb; /* 2 */
}·
::before,
::after {
  --tw-content: '';
}·
/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured `sans` font-family by default.
5. Use the user's configured `sans` font-feature-settings by default.
6. Use the user's configured `sans` font-variation-settings by default.
7. Disable tap highlights on iOS
*/·
html,
:host {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  -moz-tab-size: 4; /* 3 */
  -o-tab-size: 4;
     tab-size: 4; /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */
  font-feature-settings: normal; /* 5 */
  font-variation-settings: normal; /* 6 */
  -webkit-tap-highlight-color: transparent; /* 7 */
}·
/*
1. Remove the margin in all browsers.
2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.
*/·
body {
  margin: 0; /* 1 */
  line-height: inherit; /* 2 */
}·
/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/·
hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}·
/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/·
abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}·
/*
Remove the default font size and weight for headings.
*/·
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}·
/*
Reset links to optimize for opt-in styling instead of opt-out.
*/·
a {
  color: inherit;
  text-decoration: inherit;
}·
/*
Add the correct font weight in Edge and Safari.
*/·
b,
strong {
  font-weight: bolder;
}·
/*
1. Use the user's configured `mono` font-family by default.
2. Use the user's configured `mono` font-feature-settings by default.
3. Use the user's configured `mono` font-variation-settings by default.
4. Correct the odd `em` font sizing in all browsers.
*/·
code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */
  font-feature-settings: normal; /* 2 */
  font-variation-settings: normal; /* 3 */
  font-size: 1em; /* 4 */
}·
/*
Add the correct font size in all browsers.
*/·
small {
  font-size: 80%;
}·
/*
Prevent `sub` and `sup` elements from affecting the line height in all browsers.
*/·
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}·
sub {
  bottom: -0.25em;
}·
sup {
  top: -0.5em;
}·
/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/·
table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}·
/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/·
button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-feature-settings: inherit; /* 1 */
  font-variation-settings: inherit; /* 1 */
  font-size: 100%; /* 1 */
  font-weight: inherit; /* 1 */
  line-height: inherit; /* 1 */
  letter-spacing: inherit; /* 1 */
  color: inherit; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 3 */
}·
/*
Remove the inheritance of text transform in Edge and Firefox.
*/·
button,
select {
  text-transform: none;
}·
/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/·
button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}·
/*
Use the modern Firefox focus style for all focusable elements.
*/·
:-moz-focusring {
  outline: auto;
}·
/*
Remove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/·
:-moz-ui-invalid {
  box-shadow: none;
}·
/*
Add the correct vertical alignment in Chrome and Firefox.
*/·
progress {
  vertical-align: baseline;
}·
/*
Correct the cursor style of increment and decrement buttons in Safari.
*/·
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}·
/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/·
[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}·
/*
Remove the inner padding in Chrome and Safari on macOS.
*/·
::-webkit-search-decoration {
  -webkit-appearance: none;
}·
/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to `inherit` in Safari.
*/·
::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}·
/*
Add the correct display in Chrome and Safari.
*/·
summary {
  display: list-item;
}·
/*
Removes the default spacing and border for appropriate elements.
*/·
blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}·
fieldset {
  margin: 0;
  padding: 0;
}·
legend {
  padding: 0;
}·
ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}·
/*
Reset default styling for dialogs.
*/
dialog {
  padding: 0;
}·
/*
Prevent resizing textareas horizontally by default.
*/·
textarea {
  resize: vertical;
}·
/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/·
input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}·
input::placeholder,
textarea::placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}·
/*
Set the default cursor for buttons.
*/·
button,
[role=\"button\"] {
  cursor: pointer;
}·
/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}·
/*
1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/·
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}·
/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/·
img,
video {
  max-width: 100%;
  height: auto;
}·
/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden]:where(:not([hidden=\"until-found\"])) {
  display: none;
}
    :root {
        /* Updated color scheme to match the DoNext logo */
        --background: 210 40% 98%;
        --foreground: 222.2 84% 4.9%;·
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;·
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 84% 4.9%;·
        /* Using purple and multicolor from logo */
        --primary: 241 58% 51%;
        --primary-foreground: 210 40% 98%;·
        --secondary: 210 40% 96.1%;
        --secondary-foreground: 222.2 47.4% 11.2%;·
        --muted: 210 40% 96.1%;
        --muted-foreground: 215.4 16.3% 46.9%;·
        /* Accent color uses the logo's purple hue */
        --accent: 264 84% 74%;
        --accent-foreground: 210 40% 98%;·
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 40% 98%;·
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --ring: 264 84% 74%;·
        --radius: 0.5rem;
    }·
    .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;·
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;·
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;·
        /* Using purple from logo */
        --primary: 241 58% 51%;
        --primary-foreground: 222.2 47.4% 11.2%;·
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;·
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;·
        --accent: 264 84% 74%;
        --accent-foreground: 222.2 47.4% 11.2%;·
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;·
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 264 84% 74%;
    }
    * {
  border-color: hsl(var(--border));
}·
    body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
        font-family: 'Inter', sans-serif;
}
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 2rem;
  padding-left: 2rem;
}
@media (min-width: 1400px) {·
  .container {
    max-width: 1400px;
  }
}
.prose {
  color: var(--tw-prose-body);
  max-width: 65ch;
}
.prose :where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
.prose :where([class~=\"lead\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-lead);
  font-size: 1.25em;
  line-height: 1.6;
  margin-top: 1.2em;
  margin-bottom: 1.2em;
}
.prose :where(a):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-links);
  text-decoration: underline;
  font-weight: 500;
}
.prose :where(strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-bold);
  font-weight: 600;
}
.prose :where(a strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(blockquote strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(thead th strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: decimal;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-inline-start: 1.625em;
}
.prose :where(ol[type=\"A\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: upper-alpha;
}
.prose :where(ol[type=\"a\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: lower-alpha;
}
.prose :where(ol[type=\"A\" s]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: upper-alpha;
}
.prose :where(ol[type=\"a\" s]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: lower-alpha;
}
.prose :where(ol[type=\"I\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: upper-roman;
}
.prose :where(ol[type=\"i\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: lower-roman;
}
.prose :where(ol[type=\"I\" s]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: upper-roman;
}
.prose :where(ol[type=\"i\" s]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: lower-roman;
}
.prose :where(ol[type=\"1\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: decimal;
}
.prose :where(ul):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  list-style-type: disc;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-inline-start: 1.625em;
}
.prose :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::marker {
  font-weight: 400;
  color: var(--tw-prose-counters);
}
.prose :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::marker {
  color: var(--tw-prose-bullets);
}
.prose :where(dt):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 600;
  margin-top: 1.25em;
}
.prose :where(hr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  border-color: var(--tw-prose-hr);
  border-top-width: 1px;
  margin-top: 3em;
  margin-bottom: 3em;
}
.prose :where(blockquote):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 500;
  font-style: italic;
  color: var(--tw-prose-quotes);
  border-inline-start-width: 0.25rem;
  border-inline-start-color: var(--tw-prose-quote-borders);
  quotes: \"\\201C\"\"\\201D\"\"\\2018\"\"\\2019\";
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-inline-start: 1em;
}
.prose :where(blockquote p:first-of-type):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::before {
  content: open-quote;
}
.prose :where(blockquote p:last-of-type):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::after {
  content: close-quote;
}
.prose :where(h1):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 800;
  font-size: 2.25em;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
}
.prose :where(h1 strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 900;
  color: inherit;
}
.prose :where(h2):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}
.prose :where(h2 strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 800;
  color: inherit;
}
.prose :where(h3):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}
.prose :where(h3 strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 700;
  color: inherit;
}
.prose :where(h4):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5;
}
.prose :where(h4 strong):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 700;
  color: inherit;
}
.prose :where(img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose :where(picture):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  display: block;
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose :where(video):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose :where(kbd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-weight: 500;
  font-family: inherit;
  color: var(--tw-prose-kbd);
  box-shadow: 0 0 0 1px rgb(var(--tw-prose-kbd-shadows) / 10%), 0 3px 0 rgb(var(--tw-prose-kbd-shadows) / 10%);
  font-size: 0.875em;
  border-radius: 0.3125rem;
  padding-top: 0.1875em;
  padding-inline-end: 0.375em;
  padding-bottom: 0.1875em;
  padding-inline-start: 0.375em;
}
.prose :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-code);
  font-weight: 600;
  font-size: 0.875em;
}
.prose :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::before {
  content: \"`\";
}
.prose :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::after {
  content: \"`\";
}
.prose :where(a code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(h1 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(h2 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
  font-size: 0.875em;
}
.prose :where(h3 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
  font-size: 0.9em;
}
.prose :where(h4 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(blockquote code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(thead th code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: inherit;
}
.prose :where(pre):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-pre-code);
  background-color: var(--tw-prose-pre-bg);
  overflow-x: auto;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding-top: 0.8571429em;
  padding-inline-end: 1.1428571em;
  padding-bottom: 0.8571429em;
  padding-inline-start: 1.1428571em;
}
.prose :where(pre code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: inherit;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}
.prose :where(pre code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::before {
  content: none;
}
.prose :where(pre code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))::after {
  content: none;
}
.prose :where(table):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  width: 100%;
  table-layout: auto;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}
.prose :where(thead):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  border-bottom-width: 1px;
  border-bottom-color: var(--tw-prose-th-borders);
}
.prose :where(thead th):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-headings);
  font-weight: 600;
  vertical-align: bottom;
  padding-inline-end: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-inline-start: 0.5714286em;
}
.prose :where(tbody tr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  border-bottom-width: 1px;
  border-bottom-color: var(--tw-prose-td-borders);
}
.prose :where(tbody tr:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  border-bottom-width: 0;
}
.prose :where(tbody td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  vertical-align: baseline;
}
.prose :where(tfoot):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  border-top-width: 1px;
  border-top-color: var(--tw-prose-th-borders);
}
.prose :where(tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  vertical-align: top;
}
.prose :where(th, td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  text-align: start;
}
.prose :where(figure > *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
  margin-bottom: 0;
}
.prose :where(figcaption):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  color: var(--tw-prose-captions);
  font-size: 0.875em;
  line-height: 1.4285714;
  margin-top: 0.8571429em;
}
.prose {
  --tw-prose-body: #374151;
  --tw-prose-headings: #111827;
  --tw-prose-lead: #4b5563;
  --tw-prose-links: #111827;
  --tw-prose-bold: #111827;
  --tw-prose-counters: #6b7280;
  --tw-prose-bullets: #d1d5db;
  --tw-prose-hr: #e5e7eb;
  --tw-prose-quotes: #111827;
  --tw-prose-quote-borders: #e5e7eb;
  --tw-prose-captions: #6b7280;
  --tw-prose-kbd: #111827;
  --tw-prose-kbd-shadows: 17 24 39;
  --tw-prose-code: #111827;
  --tw-prose-pre-code: #e5e7eb;
  --tw-prose-pre-bg: #1f2937;
  --tw-prose-th-borders: #d1d5db;
  --tw-prose-td-borders: #e5e7eb;
  --tw-prose-invert-body: #d1d5db;
  --tw-prose-invert-headings: #fff;
  --tw-prose-invert-lead: #9ca3af;
  --tw-prose-invert-links: #fff;
  --tw-prose-invert-bold: #fff;
  --tw-prose-invert-counters: #9ca3af;
  --tw-prose-invert-bullets: #4b5563;
  --tw-prose-invert-hr: #374151;
  --tw-prose-invert-quotes: #f3f4f6;
  --tw-prose-invert-quote-borders: #374151;
  --tw-prose-invert-captions: #9ca3af;
  --tw-prose-invert-kbd: #fff;
  --tw-prose-invert-kbd-shadows: 255 255 255;
  --tw-prose-invert-code: #fff;
  --tw-prose-invert-pre-code: #d1d5db;
  --tw-prose-invert-pre-bg: rgb(0 0 0 / 50%);
  --tw-prose-invert-th-borders: #4b5563;
  --tw-prose-invert-td-borders: #374151;
  font-size: 1rem;
  line-height: 1.75;
}
.prose :where(picture > img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
  margin-bottom: 0;
}
.prose :where(li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.prose :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0.375em;
}
.prose :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0.375em;
}
.prose :where(.prose > ul > li p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
.prose :where(.prose > ul > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.25em;
}
.prose :where(.prose > ul > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 1.25em;
}
.prose :where(.prose > ol > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.25em;
}
.prose :where(.prose > ol > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 1.25em;
}
.prose :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
.prose :where(dl):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
.prose :where(dd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.5em;
  padding-inline-start: 1.625em;
}
.prose :where(hr + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose :where(h2 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose :where(h3 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose :where(h4 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose :where(thead th:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0;
}
.prose :where(thead th:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-end: 0;
}
.prose :where(tbody td, tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-top: 0.5714286em;
  padding-inline-end: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-inline-start: 0.5714286em;
}
.prose :where(tbody td:first-child, tfoot td:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0;
}
.prose :where(tbody td:last-child, tfoot td:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-end: 0;
}
.prose :where(figure):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose :where(.prose > :first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose :where(.prose > :last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 0;
}
.prose-sm {
  font-size: 0.875rem;
  line-height: 1.7142857;
}
.prose-sm :where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
}
.prose-sm :where([class~=\"lead\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 1.2857143em;
  line-height: 1.5555556;
  margin-top: 0.8888889em;
  margin-bottom: 0.8888889em;
}
.prose-sm :where(blockquote):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
  padding-inline-start: 1.1111111em;
}
.prose-sm :where(h1):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 2.1428571em;
  margin-top: 0;
  margin-bottom: 0.8em;
  line-height: 1.2;
}
.prose-sm :where(h2):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 1.4285714em;
  margin-top: 1.6em;
  margin-bottom: 0.8em;
  line-height: 1.4;
}
.prose-sm :where(h3):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 1.2857143em;
  margin-top: 1.5555556em;
  margin-bottom: 0.4444444em;
  line-height: 1.5555556;
}
.prose-sm :where(h4):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.4285714em;
  margin-bottom: 0.5714286em;
  line-height: 1.4285714;
}
.prose-sm :where(img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm :where(picture):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm :where(picture > img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-sm :where(video):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm :where(kbd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8571429em;
  border-radius: 0.3125rem;
  padding-top: 0.1428571em;
  padding-inline-end: 0.3571429em;
  padding-bottom: 0.1428571em;
  padding-inline-start: 0.3571429em;
}
.prose-sm :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8571429em;
}
.prose-sm :where(h2 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.9em;
}
.prose-sm :where(h3 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8888889em;
}
.prose-sm :where(pre):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8571429em;
  line-height: 1.6666667;
  margin-top: 1.6666667em;
  margin-bottom: 1.6666667em;
  border-radius: 0.25rem;
  padding-top: 0.6666667em;
  padding-inline-end: 1em;
  padding-bottom: 0.6666667em;
  padding-inline-start: 1em;
}
.prose-sm :where(ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
  padding-inline-start: 1.5714286em;
}
.prose-sm :where(ul):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
  padding-inline-start: 1.5714286em;
}
.prose-sm :where(li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.2857143em;
  margin-bottom: 0.2857143em;
}
.prose-sm :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0.4285714em;
}
.prose-sm :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0.4285714em;
}
.prose-sm :where(.prose-sm > ul > li p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.5714286em;
  margin-bottom: 0.5714286em;
}
.prose-sm :where(.prose-sm > ul > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
}
.prose-sm :where(.prose-sm > ul > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 1.1428571em;
}
.prose-sm :where(.prose-sm > ol > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
}
.prose-sm :where(.prose-sm > ol > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 1.1428571em;
}
.prose-sm :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.5714286em;
  margin-bottom: 0.5714286em;
}
.prose-sm :where(dl):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
}
.prose-sm :where(dt):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.1428571em;
}
.prose-sm :where(dd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0.2857143em;
  padding-inline-start: 1.5714286em;
}
.prose-sm :where(hr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 2.8571429em;
  margin-bottom: 2.8571429em;
}
.prose-sm :where(hr + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose-sm :where(h2 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose-sm :where(h3 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose-sm :where(h4 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose-sm :where(table):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8571429em;
  line-height: 1.5;
}
.prose-sm :where(thead th):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-end: 1em;
  padding-bottom: 0.6666667em;
  padding-inline-start: 1em;
}
.prose-sm :where(thead th:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0;
}
.prose-sm :where(thead th:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-end: 0;
}
.prose-sm :where(tbody td, tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-top: 0.6666667em;
  padding-inline-end: 1em;
  padding-bottom: 0.6666667em;
  padding-inline-start: 1em;
}
.prose-sm :where(tbody td:first-child, tfoot td:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-start: 0;
}
.prose-sm :where(tbody td:last-child, tfoot td:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  padding-inline-end: 0;
}
.prose-sm :where(figure):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm :where(figure > *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-sm :where(figcaption):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  font-size: 0.8571429em;
  line-height: 1.3333333;
  margin-top: 0.6666667em;
}
.prose-sm :where(.prose-sm > :first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-top: 0;
}
.prose-sm :where(.prose-sm > :last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
  margin-bottom: 0;
}
.priority-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding-left: 0.625rem;
  padding-right: 0.625rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}
.priority-high {
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(254 202 202 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(254 226 226 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(153 27 27 / var(--tw-text-opacity, 1));
}
.priority-high:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(185 28 28 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(127 29 29 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(254 202 202 / var(--tw-text-opacity, 1));
}
.priority-normal {
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(191 219 254 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(219 234 254 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(30 64 175 / var(--tw-text-opacity, 1));
}
.priority-normal:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(29 78 216 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(30 58 138 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(191 219 254 / var(--tw-text-opacity, 1));
}
.priority-low {
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(187 247 208 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(220 252 231 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(22 101 52 / var(--tw-text-opacity, 1));
}
.priority-low:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(21 128 61 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(20 83 45 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(187 247 208 / var(--tw-text-opacity, 1));
}
.priority-lowest {
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(217 249 157 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(236 252 203 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(63 98 18 / var(--tw-text-opacity, 1));
}
.priority-lowest:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(77 124 15 / var(--tw-border-opacity, 1));
  --tw-bg-opacity: 1;
  background-color: rgb(54 83 20 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(217 249 157 / var(--tw-text-opacity, 1));
}
.effort-chip {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}
.group-tag {
  margin-right: 0.25rem;
  display: inline-flex;
  align-items: center;
  border-radius: calc(var(--radius) - 2px);
  --tw-bg-opacity: 1;
  background-color: rgb(224 231 255 / var(--tw-bg-opacity, 1));
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  --tw-text-opacity: 1;
  color: rgb(55 48 163 / var(--tw-text-opacity, 1));
}
.group-tag:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(49 46 129 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(199 210 254 / var(--tw-text-opacity, 1));
}
.people-tag {
  margin-right: 0.25rem;
  display: inline-flex;
  align-items: center;
  border-radius: calc(var(--radius) - 2px);
  --tw-bg-opacity: 1;
  background-color: rgb(243 232 255 / var(--tw-bg-opacity, 1));
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  --tw-text-opacity: 1;
  color: rgb(107 33 168 / var(--tw-text-opacity, 1));
}
.people-tag:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(88 28 135 / var(--tw-bg-opacity, 1));
  --tw-text-opacity: 1;
  color: rgb(233 213 255 / var(--tw-text-opacity, 1));
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
}
.visible {
  visibility: visible;
}
.invisible {
  visibility: hidden;
}
.collapse {
  visibility: collapse;
}
.fixed {
  position: fixed;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.sticky {
  position: sticky;
}
.inset-0 {
  inset: 0px;
}
.inset-x-0 {
  left: 0px;
  right: 0px;
}
.inset-y-0 {
  top: 0px;
  bottom: 0px;
}
.-bottom-12 {
  bottom: -3rem;
}
.-left-12 {
  left: -3rem;
}
.-right-12 {
  right: -3rem;
}
.-top-12 {
  top: -3rem;
}
.bottom-0 {
  bottom: 0px;
}
.bottom-20 {
  bottom: 5rem;
}
.left-0 {
  left: 0px;
}
.left-1 {
  left: 0.25rem;
}
.left-1\\/2 {
  left: 50%;
}
.left-2 {
  left: 0.5rem;
}
.left-2\\.5 {
  left: 0.625rem;
}
.left-3 {
  left: 0.75rem;
}
.left-\\[50\\%\\] {
  left: 50%;
}
.right-0 {
  right: 0px;
}
.right-1 {
  right: 0.25rem;
}
.right-2 {
  right: 0.5rem;
}
.right-3 {
  right: 0.75rem;
}
.right-4 {
  right: 1rem;
}
.top-0 {
  top: 0px;
}
.top-1\\.5 {
  top: 0.375rem;
}
.top-1\\/2 {
  top: 50%;
}
.top-2 {
  top: 0.5rem;
}
.top-2\\.5 {
  top: 0.625rem;
}
.top-3 {
  top: 0.75rem;
}
.top-3\\.5 {
  top: 0.875rem;
}
.top-4 {
  top: 1rem;
}
.top-8 {
  top: 2rem;
}
.top-\\[1px\\] {
  top: 1px;
}
.top-\\[50\\%\\] {
  top: 50%;
}
.top-\\[60\\%\\] {
  top: 60%;
}
.top-full {
  top: 100%;
}
.z-10 {
  z-index: 10;
}
.z-20 {
  z-index: 20;
}
.z-50 {
  z-index: 50;
}
.z-\\[100\\] {
  z-index: 100;
}
.z-\\[1\\] {
  z-index: 1;
}
.-mx-1 {
  margin-left: -0.25rem;
  margin-right: -0.25rem;
}
.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.mx-3\\.5 {
  margin-left: 0.875rem;
  margin-right: 0.875rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.my-0\\.5 {
  margin-top: 0.125rem;
  margin-bottom: 0.125rem;
}
.my-1 {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
.my-6 {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.-ml-4 {
  margin-left: -1rem;
}
.-mt-4 {
  margin-top: -1rem;
}
.mb-0 {
  margin-bottom: 0px;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mb-5 {
  margin-bottom: 1.25rem;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.ml-1 {
  margin-left: 0.25rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
.ml-auto {
  margin-left: auto;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
.mr-4 {
  margin-right: 1rem;
}
.mt-1 {
  margin-top: 0.25rem;
}
.mt-1\\.5 {
  margin-top: 0.375rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mt-24 {
  margin-top: 6rem;
}
.mt-4 {
  margin-top: 1rem;
}
.mt-6 {
  margin-top: 1.5rem;
}
.mt-8 {
  margin-top: 2rem;
}
.mt-auto {
  margin-top: auto;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.inline-flex {
  display: inline-flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
.hidden {
  display: none;
}
.aspect-square {
  aspect-ratio: 1 / 1;
}
.aspect-video {
  aspect-ratio: 16 / 9;
}
.size-4 {
  width: 1rem;
  height: 1rem;
}
.h-1\\.5 {
  height: 0.375rem;
}
.h-10 {
  height: 2.5rem;
}
.h-11 {
  height: 2.75rem;
}
.h-12 {
  height: 3rem;
}
.h-14 {
  height: 3.5rem;
}
.h-2 {
  height: 0.5rem;
}
.h-2\\.5 {
  height: 0.625rem;
}
.h-3 {
  height: 0.75rem;
}
.h-3\\.5 {
  height: 0.875rem;
}
.h-4 {
  height: 1rem;
}
.h-5 {
  height: 1.25rem;
}
.h-6 {
  height: 1.5rem;
}
.h-7 {
  height: 1.75rem;
}
.h-8 {
  height: 2rem;
}
.h-9 {
  height: 2.25rem;
}
.h-\\[120px\\] {
  height: 120px;
}
.h-\\[1px\\] {
  height: 1px;
}
.h-\\[90vh\\] {
  height: 90vh;
}
.h-\\[var\\(--radix-navigation-menu-viewport-height\\)\\] {
  height: var(--radix-navigation-menu-viewport-height);
}
.h-\\[var\\(--radix-select-trigger-height\\)\\] {
  height: var(--radix-select-trigger-height);
}
.h-auto {
  height: auto;
}
.h-full {
  height: 100%;
}
.h-px {
  height: 1px;
}
.h-screen {
  height: 100vh;
}
.h-svh {
  height: 100svh;
}
.max-h-28 {
  max-height: 7rem;
}
.max-h-40 {
  max-height: 10rem;
}
.max-h-96 {
  max-height: 24rem;
}
.max-h-\\[150px\\] {
  max-height: 150px;
}
.max-h-\\[200px\\] {
  max-height: 200px;
}
.max-h-\\[300px\\] {
  max-height: 300px;
}
.max-h-\\[400px\\] {
  max-height: 400px;
}
.max-h-\\[70vh\\] {
  max-height: 70vh;
}
.max-h-\\[85vh\\] {
  max-height: 85vh;
}
.max-h-\\[95vh\\] {
  max-height: 95vh;
}
.max-h-screen {
  max-height: 100vh;
}
.min-h-0 {
  min-height: 0px;
}
.min-h-8 {
  min-height: 2rem;
}
.min-h-\\[120px\\] {
  min-height: 120px;
}
.min-h-\\[14px\\] {
  min-height: 14px;
}
.min-h-\\[150px\\] {
  min-height: 150px;
}
.min-h-\\[200px\\] {
  min-height: 200px;
}
.min-h-\\[60px\\] {
  min-height: 60px;
}
.min-h-\\[80px\\] {
  min-height: 80px;
}
.min-h-screen {
  min-height: 100vh;
}
.min-h-svh {
  min-height: 100svh;
}
.w-0 {
  width: 0px;
}
.w-1 {
  width: 0.25rem;
}
.w-10 {
  width: 2.5rem;
}
.w-11 {
  width: 2.75rem;
}
.w-14 {
  width: 3.5rem;
}
.w-16 {
  width: 4rem;
}
.w-2 {
  width: 0.5rem;
}
.w-2\\.5 {
  width: 0.625rem;
}
.w-20 {
  width: 5rem;
}
.w-24 {
  width: 6rem;
}
.w-3 {
  width: 0.75rem;
}
.w-3\\.5 {
  width: 0.875rem;
}
.w-3\\/4 {
  width: 75%;
}
.w-4 {
  width: 1rem;
}
.w-5 {
  width: 1.25rem;
}
.w-60 {
  width: 15rem;
}
.w-64 {
  width: 16rem;
}
.w-7 {
  width: 1.75rem;
}
.w-72 {
  width: 18rem;
}
.w-8 {
  width: 2rem;
}
.w-9 {
  width: 2.25rem;
}
.w-\\[--sidebar-width\\] {
  width: var(--sidebar-width);
}
.w-\\[100px\\] {
  width: 100px;
}
.w-\\[180px\\] {
  width: 180px;
}
.w-\\[1px\\] {
  width: 1px;
}
.w-\\[40px\\] {
  width: 40px;
}
.w-\\[95vw\\] {
  width: 95vw;
}
.w-auto {
  width: auto;
}
.w-full {
  width: 100%;
}
.w-max {
  width: -moz-max-content;
  width: max-content;
}
.w-px {
  width: 1px;
}
.min-w-0 {
  min-width: 0px;
}
.min-w-5 {
  min-width: 1.25rem;
}
.min-w-\\[12rem\\] {
  min-width: 12rem;
}
.min-w-\\[8rem\\] {
  min-width: 8rem;
}
.min-w-\\[var\\(--radix-select-trigger-width\\)\\] {
  min-width: var(--radix-select-trigger-width);
}
.max-w-2xl {
  max-width: 42rem;
}
.max-w-4xl {
  max-width: 56rem;
}
.max-w-\\[--skeleton-width\\] {
  max-width: var(--skeleton-width);
}
.max-w-\\[200px\\] {
  max-width: 200px;
}
.max-w-lg {
  max-width: 32rem;
}
.max-w-max {
  max-width: -moz-max-content;
  max-width: max-content;
}
.max-w-md {
  max-width: 28rem;
}
.max-w-none {
  max-width: none;
}
.flex-1 {
  flex: 1 1 0%;
}
.flex-shrink-0 {
  flex-shrink: 0;
}
.shrink-0 {
  flex-shrink: 0;
}
.flex-grow {
  flex-grow: 1;
}
.grow {
  flex-grow: 1;
}
.grow-0 {
  flex-grow: 0;
}
.basis-full {
  flex-basis: 100%;
}
.caption-bottom {
  caption-side: bottom;
}
.border-collapse {
  border-collapse: collapse;
}
.-translate-x-1\\/2 {
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.-translate-x-px {
  --tw-translate-x: -1px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.-translate-y-1\\/2 {
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.translate-x-\\[-50\\%\\] {
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.translate-x-px {
  --tw-translate-x: 1px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.translate-y-\\[-50\\%\\] {
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.rotate-45 {
  --tw-rotate: 45deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.rotate-90 {
  --tw-rotate: 90deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
@keyframes pulse {·
  50% {
    opacity: .5;
  }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes spin {·
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.cursor-default {
  cursor: default;
}
.cursor-pointer {
  cursor: pointer;
}
.touch-none {
  touch-action: none;
}
.select-none {
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.resize-none {
  resize: none;
}
.list-none {
  list-style-type: none;
}
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.flex-row {
  flex-direction: row;
}
.flex-col {
  flex-direction: column;
}
.flex-col-reverse {
  flex-direction: column-reverse;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-start {
  align-items: flex-start;
}
.items-end {
  align-items: flex-end;
}
.items-center {
  align-items: center;
}
.items-stretch {
  align-items: stretch;
}
.justify-start {
  justify-content: flex-start;
}
.justify-end {
  justify-content: flex-end;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-0 {
  gap: 0px;
}
.gap-1 {
  gap: 0.25rem;
}
.gap-1\\.5 {
  gap: 0.375rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.gap-4 {
  gap: 1rem;
}
.gap-6 {
  gap: 1.5rem;
}
.space-x-1 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.25rem * var(--tw-space-x-reverse));
  margin-left: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));
}
.space-x-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.5rem * var(--tw-space-x-reverse));
  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
}
.space-x-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(1rem * var(--tw-space-x-reverse));
  margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
}
.space-y-1 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
}
.space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.375rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.375rem * var(--tw-space-y-reverse));
}
.space-y-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
}
.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}
.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
}
.self-end {
  align-self: flex-end;
}
.overflow-auto {
  overflow: auto;
}
.overflow-hidden {
  overflow: hidden;
}
.overflow-y-auto {
  overflow-y: auto;
}
.overflow-x-hidden {
  overflow-x: hidden;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.whitespace-nowrap {
  white-space: nowrap;
}
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
.break-words {
  overflow-wrap: break-word;
}
.rounded {
  border-radius: 0.25rem;
}
.rounded-\\[2px\\] {
  border-radius: 2px;
}
.rounded-\\[inherit\\] {
  border-radius: inherit;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-lg {
  border-radius: var(--radius);
}
.rounded-md {
  border-radius: calc(var(--radius) - 2px);
}
.rounded-sm {
  border-radius: calc(var(--radius) - 4px);
}
.rounded-b-md {
  border-bottom-right-radius: calc(var(--radius) - 2px);
  border-bottom-left-radius: calc(var(--radius) - 2px);
}
.rounded-t-\\[10px\\] {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.rounded-t-md {
  border-top-left-radius: calc(var(--radius) - 2px);
  border-top-right-radius: calc(var(--radius) - 2px);
}
.rounded-tl-sm {
  border-top-left-radius: calc(var(--radius) - 4px);
}
.border {
  border-width: 1px;
}
.border-2 {
  border-width: 2px;
}
.border-\\[1\\.5px\\] {
  border-width: 1.5px;
}
.border-x {
  border-left-width: 1px;
  border-right-width: 1px;
}
.border-y {
  border-top-width: 1px;
  border-bottom-width: 1px;
}
.border-b {
  border-bottom-width: 1px;
}
.border-l {
  border-left-width: 1px;
}
.border-l-2 {
  border-left-width: 2px;
}
.border-l-4 {
  border-left-width: 4px;
}
.border-r {
  border-right-width: 1px;
}
.border-t {
  border-top-width: 1px;
}
.border-dashed {
  border-style: dashed;
}
.border-\\[--color-border\\] {
  border-color: var(--color-border);
}
.border-amber-200 {
  --tw-border-opacity: 1;
  border-color: rgb(253 230 138 / var(--tw-border-opacity, 1));
}
.border-amber-300 {
  --tw-border-opacity: 1;
  border-color: rgb(252 211 77 / var(--tw-border-opacity, 1));
}
.border-amber-400 {
  --tw-border-opacity: 1;
  border-color: rgb(251 191 36 / var(--tw-border-opacity, 1));
}
.border-blue-500 {
  --tw-border-opacity: 1;
  border-color: rgb(59 130 246 / var(--tw-border-opacity, 1));
}
.border-border {
  border-color: hsl(var(--border));
}
.border-border\\/50 {
  border-color: hsl(var(--border) / 0.5);
}
.border-destructive {
  border-color: hsl(var(--destructive));
}
.border-destructive\\/50 {
  border-color: hsl(var(--destructive) / 0.5);
}
.border-gray-300 {
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity, 1));
}
.border-input {
  border-color: hsl(var(--input));
}
.border-primary {
  border-color: hsl(var(--primary));
}
.border-primary\\/20 {
  border-color: hsl(var(--primary) / 0.2);
}
.border-red-200 {
  --tw-border-opacity: 1;
  border-color: rgb(254 202 202 / var(--tw-border-opacity, 1));
}
.border-red-400 {
  --tw-border-opacity: 1;
  border-color: rgb(248 113 113 / var(--tw-border-opacity, 1));
}
.border-sidebar-border {
  border-color: hsl(var(--sidebar-border));
}
.border-slate-300 {
  --tw-border-opacity: 1;
  border-color: rgb(203 213 225 / var(--tw-border-opacity, 1));
}
.border-transparent {
  border-color: transparent;
}
.border-l-transparent {
  border-left-color: transparent;
}
.border-t-transparent {
  border-top-color: transparent;
}
.bg-\\[--color-bg\\] {
  background-color: var(--color-bg);
}
.bg-accent {
  background-color: hsl(var(--accent));
}
.bg-amber-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 243 199 / var(--tw-bg-opacity, 1));
}
.bg-amber-100\\/95 {
  background-color: rgb(254 243 199 / 0.95);
}
.bg-amber-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(253 230 138 / var(--tw-bg-opacity, 1));
}
.bg-amber-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(255 251 235 / var(--tw-bg-opacity, 1));
}
.bg-amber-50\\/25 {
  background-color: rgb(255 251 235 / 0.25);
}
.bg-background {
  background-color: hsl(var(--background));
}
.bg-black\\/80 {
  background-color: rgb(0 0 0 / 0.8);
}
.bg-blue-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(219 234 254 / var(--tw-bg-opacity, 1));
}
.bg-border {
  background-color: hsl(var(--border));
}
.bg-card {
  background-color: hsl(var(--card));
}
.bg-cyan-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(207 250 254 / var(--tw-bg-opacity, 1));
}
.bg-destructive {
  background-color: hsl(var(--destructive));
}
.bg-foreground {
  background-color: hsl(var(--foreground));
}
.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
}
.bg-gray-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));
}
.bg-gray-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity, 1));
}
.bg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(34 197 94 / var(--tw-bg-opacity, 1));
}
.bg-muted {
  background-color: hsl(var(--muted));
}
.bg-muted\\/20 {
  background-color: hsl(var(--muted) / 0.2);
}
.bg-muted\\/30 {
  background-color: hsl(var(--muted) / 0.3);
}
.bg-muted\\/50 {
  background-color: hsl(var(--muted) / 0.5);
}
.bg-orange-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(255 237 213 / var(--tw-bg-opacity, 1));
}
.bg-popover {
  background-color: hsl(var(--popover));
}
.bg-primary {
  background-color: hsl(var(--primary));
}
.bg-primary\\/10 {
  background-color: hsl(var(--primary) / 0.1);
}
.bg-purple-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 232 255 / var(--tw-bg-opacity, 1));
}
.bg-red-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 226 226 / var(--tw-bg-opacity, 1));
}
.bg-red-100\\/95 {
  background-color: rgb(254 226 226 / 0.95);
}
.bg-red-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 202 202 / var(--tw-bg-opacity, 1));
}
.bg-red-50\\/25 {
  background-color: rgb(254 242 242 / 0.25);
}
.bg-secondary {
  background-color: hsl(var(--secondary));
}
.bg-sidebar {
  background-color: hsl(var(--sidebar-background));
}
.bg-sidebar-border {
  background-color: hsl(var(--sidebar-border));
}
.bg-slate-100\\/95 {
  background-color: rgb(241 245 249 / 0.95);
}
.bg-slate-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(226 232 240 / var(--tw-bg-opacity, 1));
}
.bg-slate-50\\/25 {
  background-color: rgb(248 250 252 / 0.25);
}
.bg-transparent {
  background-color: transparent;
}
.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}
.fill-blue-600 {
  fill: #2563eb;
}
.fill-current {
  fill: currentColor;
}
.p-0 {
  padding: 0px;
}
.p-0\\.5 {
  padding: 0.125rem;
}
.p-1 {
  padding: 0.25rem;
}
.p-1\\.5 {
  padding: 0.375rem;
}
.p-2 {
  padding: 0.5rem;
}
.p-3 {
  padding: 0.75rem;
}
.p-4 {
  padding: 1rem;
}
.p-6 {
  padding: 1.5rem;
}
.p-\\[1px\\] {
  padding: 1px;
}
.px-0 {
  padding-left: 0px;
  padding-right: 0px;
}
.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.px-2\\.5 {
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.px-5 {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}
.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}
.py-0 {
  padding-top: 0px;
  padding-bottom: 0px;
}
.py-0\\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.py-1\\.5 {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}
.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.py-2\\.5 {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}
.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}
.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.pb-16 {
  padding-bottom: 4rem;
}
.pb-3 {
  padding-bottom: 0.75rem;
}
.pb-4 {
  padding-bottom: 1rem;
}
.pl-10 {
  padding-left: 2.5rem;
}
.pl-2 {
  padding-left: 0.5rem;
}
.pl-2\\.5 {
  padding-left: 0.625rem;
}
.pl-3 {
  padding-left: 0.75rem;
}
.pl-4 {
  padding-left: 1rem;
}
.pl-8 {
  padding-left: 2rem;
}
.pl-9 {
  padding-left: 2.25rem;
}
.pr-0 {
  padding-right: 0px;
}
.pr-1 {
  padding-right: 0.25rem;
}
.pr-2 {
  padding-right: 0.5rem;
}
.pr-2\\.5 {
  padding-right: 0.625rem;
}
.pr-8 {
  padding-right: 2rem;
}
.pt-0 {
  padding-top: 0px;
}
.pt-1 {
  padding-top: 0.25rem;
}
.pt-2 {
  padding-top: 0.5rem;
}
.pt-3 {
  padding-top: 0.75rem;
}
.pt-4 {
  padding-top: 1rem;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.align-middle {
  vertical-align: middle;
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}
.text-\\[0\\.8rem\\] {
  font-size: 0.8rem;
}
.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}
.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}
.font-bold {
  font-weight: 700;
}
.font-medium {
  font-weight: 500;
}
.font-normal {
  font-weight: 400;
}
.font-semibold {
  font-weight: 600;
}
.uppercase {
  text-transform: uppercase;
}
.capitalize {
  text-transform: capitalize;
}
.italic {
  font-style: italic;
}
.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}
.leading-none {
  line-height: 1;
}
.tracking-tight {
  letter-spacing: -0.025em;
}
.tracking-widest {
  letter-spacing: 0.1em;
}
.text-accent-foreground {
  color: hsl(var(--accent-foreground));
}
.text-amber-800 {
  --tw-text-opacity: 1;
  color: rgb(146 64 14 / var(--tw-text-opacity, 1));
}
.text-blue-500 {
  --tw-text-opacity: 1;
  color: rgb(59 130 246 / var(--tw-text-opacity, 1));
}
.text-blue-600 {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity, 1));
}
.text-blue-800 {
  --tw-text-opacity: 1;
  color: rgb(30 64 175 / var(--tw-text-opacity, 1));
}
.text-card-foreground {
  color: hsl(var(--card-foreground));
}
.text-current {
  color: currentColor;
}
.text-cyan-800 {
  --tw-text-opacity: 1;
  color: rgb(21 94 117 / var(--tw-text-opacity, 1));
}
.text-destructive {
  color: hsl(var(--destructive));
}
.text-destructive-foreground {
  color: hsl(var(--destructive-foreground));
}
.text-foreground {
  color: hsl(var(--foreground));
}
.text-foreground\\/50 {
  color: hsl(var(--foreground) / 0.5);
}
.text-gray-200 {
  --tw-text-opacity: 1;
  color: rgb(229 231 235 / var(--tw-text-opacity, 1));
}
.text-gray-500 {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}
.text-gray-600 {
  --tw-text-opacity: 1;
  color: rgb(75 85 99 / var(--tw-text-opacity, 1));
}
.text-gray-700 {
  --tw-text-opacity: 1;
  color: rgb(55 65 81 / var(--tw-text-opacity, 1));
}
.text-gray-800 {
  --tw-text-opacity: 1;
  color: rgb(31 41 55 / var(--tw-text-opacity, 1));
}
.text-green-500 {
  --tw-text-opacity: 1;
  color: rgb(34 197 94 / var(--tw-text-opacity, 1));
}
.text-muted-foreground {
  color: hsl(var(--muted-foreground));
}
.text-orange-500 {
  --tw-text-opacity: 1;
  color: rgb(249 115 22 / var(--tw-text-opacity, 1));
}
.text-orange-800 {
  --tw-text-opacity: 1;
  color: rgb(154 52 18 / var(--tw-text-opacity, 1));
}
.text-popover-foreground {
  color: hsl(var(--popover-foreground));
}
.text-primary {
  color: hsl(var(--primary));
}
.text-primary-foreground {
  color: hsl(var(--primary-foreground));
}
.text-purple-800 {
  --tw-text-opacity: 1;
  color: rgb(107 33 168 / var(--tw-text-opacity, 1));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity, 1));
}
.text-red-800 {
  --tw-text-opacity: 1;
  color: rgb(153 27 27 / var(--tw-text-opacity, 1));
}
.text-secondary-foreground {
  color: hsl(var(--secondary-foreground));
}
.text-sidebar-foreground {
  color: hsl(var(--sidebar-foreground));
}
.text-sidebar-foreground\\/70 {
  color: hsl(var(--sidebar-foreground) / 0.7);
}
.text-slate-500 {
  --tw-text-opacity: 1;
  color: rgb(100 116 139 / var(--tw-text-opacity, 1));
}
.text-slate-700 {
  --tw-text-opacity: 1;
  color: rgb(51 65 85 / var(--tw-text-opacity, 1));
}
.text-slate-900 {
  --tw-text-opacity: 1;
  color: rgb(15 23 42 / var(--tw-text-opacity, 1));
}
.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}
.underline {
  text-decoration-line: underline;
}
.underline-offset-4 {
  text-underline-offset: 4px;
}
.opacity-0 {
  opacity: 0;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-60 {
  opacity: 0.6;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-90 {
  opacity: 0.9;
}
.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-\\[0_0_0_1px_hsl\\(var\\(--sidebar-border\\)\\)\\] {
  --tw-shadow: 0 0 0 1px hsl(var(--sidebar-border));
  --tw-shadow-colored: 0 0 0 1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-none {
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-xl {
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.outline {
  outline-style: solid;
}
.ring-0 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
.ring-2 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
.ring-ring {
  --tw-ring-color: hsl(var(--ring));
}
.ring-sidebar-ring {
  --tw-ring-color: hsl(var(--sidebar-ring));
}
.ring-offset-background {
  --tw-ring-offset-color: hsl(var(--background));
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}
.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-\\[left\\2c right\\2c width\\] {
  transition-property: left,right,width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-\\[margin\\2c opa\\] {
  transition-property: margin,opa;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-\\[width\\2c height\\2c padding\\] {
  transition-property: width,height,padding;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-\\[width\\] {
  transition-property: width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.duration-1000 {
  transition-duration: 1000ms;
}
.duration-200 {
  transition-duration: 200ms;
}
.duration-300 {
  transition-duration: 300ms;
}
.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.ease-linear {
  transition-timing-function: linear;
}
.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
@keyframes enter {·
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}
@keyframes exit {·
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}
.animate-in {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}
.fade-in-0 {
  --tw-enter-opacity: 0;
}
.fade-in-80 {
  --tw-enter-opacity: 0.8;
}
.zoom-in-95 {
  --tw-enter-scale: .95;
}
.duration-1000 {
  animation-duration: 1000ms;
}
.duration-200 {
  animation-duration: 200ms;
}
.duration-300 {
  animation-duration: 300ms;
}
.ease-in-out {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.ease-linear {
  animation-timing-function: linear;
}
.ease-out {
  animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
.running {
  animation-play-state: running;
}·
/* Custom button styles to match the DoNext logo colors */
.btn-donext {
    background: linear-gradient(90deg, #000000, #7f3fbf, #34a8e0, #00b25b);
    background-size: 300% 100%;
    transition: background-position 0.5s;
}·
.btn-donext:hover {
    background-position: 100% 0;
}·
.dark\\:prose-invert:is(.dark *) {
  --tw-prose-body: var(--tw-prose-invert-body);
  --tw-prose-headings: var(--tw-prose-invert-headings);
  --tw-prose-lead: var(--tw-prose-invert-lead);
  --tw-prose-links: var(--tw-prose-invert-links);
  --tw-prose-bold: var(--tw-prose-invert-bold);
  --tw-prose-counters: var(--tw-prose-invert-counters);
  --tw-prose-bullets: var(--tw-prose-invert-bullets);
  --tw-prose-hr: var(--tw-prose-invert-hr);
  --tw-prose-quotes: var(--tw-prose-invert-quotes);
  --tw-prose-quote-borders: var(--tw-prose-invert-quote-borders);
  --tw-prose-captions: var(--tw-prose-invert-captions);
  --tw-prose-kbd: var(--tw-prose-invert-kbd);
  --tw-prose-kbd-shadows: var(--tw-prose-invert-kbd-shadows);
  --tw-prose-code: var(--tw-prose-invert-code);
  --tw-prose-pre-code: var(--tw-prose-invert-pre-code);
  --tw-prose-pre-bg: var(--tw-prose-invert-pre-bg);
  --tw-prose-th-borders: var(--tw-prose-invert-th-borders);
  --tw-prose-td-borders: var(--tw-prose-invert-td-borders);
}·
@media (min-width: 640px) {·
  .sm\\:prose-base {
    font-size: 1rem;
    line-height: 1.75;
  }·
  .sm\\:prose-base :where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
  }·
  .sm\\:prose-base :where([class~=\"lead\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.25em;
    line-height: 1.6;
    margin-top: 1.2em;
    margin-bottom: 1.2em;
  }·
  .sm\\:prose-base :where(blockquote):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.6em;
    margin-bottom: 1.6em;
    padding-inline-start: 1em;
  }·
  .sm\\:prose-base :where(h1):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 2.25em;
    margin-top: 0;
    margin-bottom: 0.8888889em;
    line-height: 1.1111111;
  }·
  .sm\\:prose-base :where(h2):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.5em;
    margin-top: 2em;
    margin-bottom: 1em;
    line-height: 1.3333333;
  }·
  .sm\\:prose-base :where(h3):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.25em;
    margin-top: 1.6em;
    margin-bottom: 0.6em;
    line-height: 1.6;
  }·
  .sm\\:prose-base :where(h4):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.5;
  }·
  .sm\\:prose-base :where(img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .sm\\:prose-base :where(picture):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .sm\\:prose-base :where(picture > img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .sm\\:prose-base :where(video):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .sm\\:prose-base :where(kbd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
    border-radius: 0.3125rem;
    padding-top: 0.1875em;
    padding-inline-end: 0.375em;
    padding-bottom: 0.1875em;
    padding-inline-start: 0.375em;
  }·
  .sm\\:prose-base :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
  }·
  .sm\\:prose-base :where(h2 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
  }·
  .sm\\:prose-base :where(h3 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.9em;
  }·
  .sm\\:prose-base :where(pre):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
    line-height: 1.7142857;
    margin-top: 1.7142857em;
    margin-bottom: 1.7142857em;
    border-radius: 0.375rem;
    padding-top: 0.8571429em;
    padding-inline-end: 1.1428571em;
    padding-bottom: 0.8571429em;
    padding-inline-start: 1.1428571em;
  }·
  .sm\\:prose-base :where(ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
    padding-inline-start: 1.625em;
  }·
  .sm\\:prose-base :where(ul):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
    padding-inline-start: 1.625em;
  }·
  .sm\\:prose-base :where(li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }·
  .sm\\:prose-base :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.375em;
  }·
  .sm\\:prose-base :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.375em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > ul > li p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > ul > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > ul > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.25em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > ol > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > ol > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.25em;
  }·
  .sm\\:prose-base :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
  }·
  .sm\\:prose-base :where(dl):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
  }·
  .sm\\:prose-base :where(dt):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.25em;
  }·
  .sm\\:prose-base :where(dd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.5em;
    padding-inline-start: 1.625em;
  }·
  .sm\\:prose-base :where(hr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 3em;
    margin-bottom: 3em;
  }·
  .sm\\:prose-base :where(hr + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .sm\\:prose-base :where(h2 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .sm\\:prose-base :where(h3 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .sm\\:prose-base :where(h4 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .sm\\:prose-base :where(table):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
    line-height: 1.7142857;
  }·
  .sm\\:prose-base :where(thead th):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0.5714286em;
    padding-bottom: 0.5714286em;
    padding-inline-start: 0.5714286em;
  }·
  .sm\\:prose-base :where(thead th:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .sm\\:prose-base :where(thead th:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .sm\\:prose-base :where(tbody td, tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-top: 0.5714286em;
    padding-inline-end: 0.5714286em;
    padding-bottom: 0.5714286em;
    padding-inline-start: 0.5714286em;
  }·
  .sm\\:prose-base :where(tbody td:first-child, tfoot td:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .sm\\:prose-base :where(tbody td:last-child, tfoot td:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .sm\\:prose-base :where(figure):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .sm\\:prose-base :where(figure > *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .sm\\:prose-base :where(figcaption):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
    line-height: 1.4285714;
    margin-top: 0.8571429em;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > :first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .sm\\:prose-base :where(.sm\\:prose-base > :last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 0;
  }
}·
@media (min-width: 1024px) {·
  .lg\\:prose-lg {
    font-size: 1.125rem;
    line-height: 1.7777778;
  }·
  .lg\\:prose-lg :where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
  }·
  .lg\\:prose-lg :where([class~=\"lead\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.2222222em;
    line-height: 1.4545455;
    margin-top: 1.0909091em;
    margin-bottom: 1.0909091em;
  }·
  .lg\\:prose-lg :where(blockquote):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.6666667em;
    margin-bottom: 1.6666667em;
    padding-inline-start: 1em;
  }·
  .lg\\:prose-lg :where(h1):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 2.6666667em;
    margin-top: 0;
    margin-bottom: 0.8333333em;
    line-height: 1;
  }·
  .lg\\:prose-lg :where(h2):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.6666667em;
    margin-top: 1.8666667em;
    margin-bottom: 1.0666667em;
    line-height: 1.3333333;
  }·
  .lg\\:prose-lg :where(h3):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.3333333em;
    margin-top: 1.6666667em;
    margin-bottom: 0.6666667em;
    line-height: 1.5;
  }·
  .lg\\:prose-lg :where(h4):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 0.4444444em;
    line-height: 1.5555556;
  }·
  .lg\\:prose-lg :where(img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 1.7777778em;
  }·
  .lg\\:prose-lg :where(picture):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 1.7777778em;
  }·
  .lg\\:prose-lg :where(picture > img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .lg\\:prose-lg :where(video):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 1.7777778em;
  }·
  .lg\\:prose-lg :where(kbd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
    border-radius: 0.3125rem;
    padding-top: 0.2222222em;
    padding-inline-end: 0.4444444em;
    padding-bottom: 0.2222222em;
    padding-inline-start: 0.4444444em;
  }·
  .lg\\:prose-lg :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
  }·
  .lg\\:prose-lg :where(h2 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8666667em;
  }·
  .lg\\:prose-lg :where(h3 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
  }·
  .lg\\:prose-lg :where(pre):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
    line-height: 1.75;
    margin-top: 2em;
    margin-bottom: 2em;
    border-radius: 0.375rem;
    padding-top: 1em;
    padding-inline-end: 1.5em;
    padding-bottom: 1em;
    padding-inline-start: 1.5em;
  }·
  .lg\\:prose-lg :where(ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
    padding-inline-start: 1.5555556em;
  }·
  .lg\\:prose-lg :where(ul):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
    padding-inline-start: 1.5555556em;
  }·
  .lg\\:prose-lg :where(li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.6666667em;
    margin-bottom: 0.6666667em;
  }·
  .lg\\:prose-lg :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.4444444em;
  }·
  .lg\\:prose-lg :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.4444444em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > ul > li p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.8888889em;
    margin-bottom: 0.8888889em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > ul > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > ul > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.3333333em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > ol > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > ol > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.3333333em;
  }·
  .lg\\:prose-lg :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.8888889em;
    margin-bottom: 0.8888889em;
  }·
  .lg\\:prose-lg :where(dl):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
  }·
  .lg\\:prose-lg :where(dt):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .lg\\:prose-lg :where(dd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.6666667em;
    padding-inline-start: 1.5555556em;
  }·
  .lg\\:prose-lg :where(hr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 3.1111111em;
    margin-bottom: 3.1111111em;
  }·
  .lg\\:prose-lg :where(hr + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .lg\\:prose-lg :where(h2 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .lg\\:prose-lg :where(h3 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .lg\\:prose-lg :where(h4 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .lg\\:prose-lg :where(table):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
    line-height: 1.5;
  }·
  .lg\\:prose-lg :where(thead th):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0.75em;
    padding-bottom: 0.75em;
    padding-inline-start: 0.75em;
  }·
  .lg\\:prose-lg :where(thead th:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .lg\\:prose-lg :where(thead th:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .lg\\:prose-lg :where(tbody td, tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-top: 0.75em;
    padding-inline-end: 0.75em;
    padding-bottom: 0.75em;
    padding-inline-start: 0.75em;
  }·
  .lg\\:prose-lg :where(tbody td:first-child, tfoot td:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .lg\\:prose-lg :where(tbody td:last-child, tfoot td:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .lg\\:prose-lg :where(figure):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 1.7777778em;
  }·
  .lg\\:prose-lg :where(figure > *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .lg\\:prose-lg :where(figcaption):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
    line-height: 1.5;
    margin-top: 1em;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > :first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .lg\\:prose-lg :where(.lg\\:prose-lg > :last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 0;
  }
}·
@media (min-width: 1280px) {·
  .xl\\:prose-2xl {
    font-size: 1.5rem;
    line-height: 1.6666667;
  }·
  .xl\\:prose-2xl :where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
  }·
  .xl\\:prose-2xl :where([class~=\"lead\"]):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.25em;
    line-height: 1.4666667;
    margin-top: 1.0666667em;
    margin-bottom: 1.0666667em;
  }·
  .xl\\:prose-2xl :where(blockquote):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.7777778em;
    margin-bottom: 1.7777778em;
    padding-inline-start: 1.1111111em;
  }·
  .xl\\:prose-2xl :where(h1):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 2.6666667em;
    margin-top: 0;
    margin-bottom: 0.875em;
    line-height: 1;
  }·
  .xl\\:prose-2xl :where(h2):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 0.8333333em;
    line-height: 1.0833333;
  }·
  .xl\\:prose-2xl :where(h3):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 1.5em;
    margin-top: 1.5555556em;
    margin-bottom: 0.6666667em;
    line-height: 1.2222222;
  }·
  .xl\\:prose-2xl :where(h4):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.6666667em;
    margin-bottom: 0.6666667em;
    line-height: 1.5;
  }·
  .xl\\:prose-2xl :where(img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .xl\\:prose-2xl :where(picture):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .xl\\:prose-2xl :where(picture > img):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .xl\\:prose-2xl :where(video):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .xl\\:prose-2xl :where(kbd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8333333em;
    border-radius: 0.375rem;
    padding-top: 0.25em;
    padding-inline-end: 0.3333333em;
    padding-bottom: 0.25em;
    padding-inline-start: 0.3333333em;
  }·
  .xl\\:prose-2xl :where(code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8333333em;
  }·
  .xl\\:prose-2xl :where(h2 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.875em;
  }·
  .xl\\:prose-2xl :where(h3 code):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8888889em;
  }·
  .xl\\:prose-2xl :where(pre):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8333333em;
    line-height: 1.8;
    margin-top: 2em;
    margin-bottom: 2em;
    border-radius: 0.5rem;
    padding-top: 1.2em;
    padding-inline-end: 1.6em;
    padding-bottom: 1.2em;
    padding-inline-start: 1.6em;
  }·
  .xl\\:prose-2xl :where(ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
    padding-inline-start: 1.5833333em;
  }·
  .xl\\:prose-2xl :where(ul):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
    padding-inline-start: 1.5833333em;
  }·
  .xl\\:prose-2xl :where(li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }·
  .xl\\:prose-2xl :where(ol > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.4166667em;
  }·
  .xl\\:prose-2xl :where(ul > li):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0.4166667em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > ul > li p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.8333333em;
    margin-bottom: 0.8333333em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > ul > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > ul > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > ol > li > p:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > ol > li > p:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.6666667em;
    margin-bottom: 0.6666667em;
  }·
  .xl\\:prose-2xl :where(dl):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
    margin-bottom: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(dt):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 1.3333333em;
  }·
  .xl\\:prose-2xl :where(dd):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0.5em;
    padding-inline-start: 1.5833333em;
  }·
  .xl\\:prose-2xl :where(hr):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 3em;
    margin-bottom: 3em;
  }·
  .xl\\:prose-2xl :where(hr + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .xl\\:prose-2xl :where(h2 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .xl\\:prose-2xl :where(h3 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .xl\\:prose-2xl :where(h4 + *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .xl\\:prose-2xl :where(table):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8333333em;
    line-height: 1.4;
  }·
  .xl\\:prose-2xl :where(thead th):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0.6em;
    padding-bottom: 0.8em;
    padding-inline-start: 0.6em;
  }·
  .xl\\:prose-2xl :where(thead th:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .xl\\:prose-2xl :where(thead th:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .xl\\:prose-2xl :where(tbody td, tfoot td):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-top: 0.8em;
    padding-inline-end: 0.6em;
    padding-bottom: 0.8em;
    padding-inline-start: 0.6em;
  }·
  .xl\\:prose-2xl :where(tbody td:first-child, tfoot td:first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-start: 0;
  }·
  .xl\\:prose-2xl :where(tbody td:last-child, tfoot td:last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    padding-inline-end: 0;
  }·
  .xl\\:prose-2xl :where(figure):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 2em;
    margin-bottom: 2em;
  }·
  .xl\\:prose-2xl :where(figure > *):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
    margin-bottom: 0;
  }·
  .xl\\:prose-2xl :where(figcaption):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    font-size: 0.8333333em;
    line-height: 1.6;
    margin-top: 1em;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > :first-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-top: 0;
  }·
  .xl\\:prose-2xl :where(.xl\\:prose-2xl > :last-child):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *)) {
    margin-bottom: 0;
  }
}·
.file\\:border-0::file-selector-button {
  border-width: 0px;
}·
.file\\:bg-transparent::file-selector-button {
  background-color: transparent;
}·
.file\\:text-sm::file-selector-button {
  font-size: 0.875rem;
  line-height: 1.25rem;
}·
.file\\:font-medium::file-selector-button {
  font-weight: 500;
}·
.file\\:text-foreground::file-selector-button {
  color: hsl(var(--foreground));
}·
.placeholder\\:text-muted-foreground::-moz-placeholder {
  color: hsl(var(--muted-foreground));
}·
.placeholder\\:text-muted-foreground::placeholder {
  color: hsl(var(--muted-foreground));
}·
.after\\:absolute::after {
  content: var(--tw-content);
  position: absolute;
}·
.after\\:-inset-2::after {
  content: var(--tw-content);
  inset: -0.5rem;
}·
.after\\:inset-y-0::after {
  content: var(--tw-content);
  top: 0px;
  bottom: 0px;
}·
.after\\:left-1\\/2::after {
  content: var(--tw-content);
  left: 50%;
}·
.after\\:w-1::after {
  content: var(--tw-content);
  width: 0.25rem;
}·
.after\\:w-\\[2px\\]::after {
  content: var(--tw-content);
  width: 2px;
}·
.after\\:-translate-x-1\\/2::after {
  content: var(--tw-content);
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.first\\:rounded-l-md:first-child {
  border-top-left-radius: calc(var(--radius) - 2px);
  border-bottom-left-radius: calc(var(--radius) - 2px);
}·
.first\\:border-l:first-child {
  border-left-width: 1px;
}·
.last\\:rounded-r-md:last-child {
  border-top-right-radius: calc(var(--radius) - 2px);
  border-bottom-right-radius: calc(var(--radius) - 2px);
}·
.last\\:border-b-0:last-child {
  border-bottom-width: 0px;
}·
.focus-within\\:relative:focus-within {
  position: relative;
}·
.focus-within\\:z-20:focus-within {
  z-index: 20;
}·
.hover\\:border-primary\\/70:hover {
  border-color: hsl(var(--primary) / 0.7);
}·
.hover\\:bg-accent:hover {
  background-color: hsl(var(--accent));
}·
.hover\\:bg-destructive\\/80:hover {
  background-color: hsl(var(--destructive) / 0.8);
}·
.hover\\:bg-destructive\\/90:hover {
  background-color: hsl(var(--destructive) / 0.9);
}·
.hover\\:bg-gray-100:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
}·
.hover\\:bg-muted:hover {
  background-color: hsl(var(--muted));
}·
.hover\\:bg-muted\\/50:hover {
  background-color: hsl(var(--muted) / 0.5);
}·
.hover\\:bg-primary:hover {
  background-color: hsl(var(--primary));
}·
.hover\\:bg-primary\\/80:hover {
  background-color: hsl(var(--primary) / 0.8);
}·
.hover\\:bg-primary\\/90:hover {
  background-color: hsl(var(--primary) / 0.9);
}·
.hover\\:bg-red-200:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(254 202 202 / var(--tw-bg-opacity, 1));
}·
.hover\\:bg-secondary:hover {
  background-color: hsl(var(--secondary));
}·
.hover\\:bg-secondary\\/80:hover {
  background-color: hsl(var(--secondary) / 0.8);
}·
.hover\\:bg-sidebar-accent:hover {
  background-color: hsl(var(--sidebar-accent));
}·
.hover\\:bg-white:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}·
.hover\\:text-accent-foreground:hover {
  color: hsl(var(--accent-foreground));
}·
.hover\\:text-blue-700:hover {
  --tw-text-opacity: 1;
  color: rgb(29 78 216 / var(--tw-text-opacity, 1));
}·
.hover\\:text-destructive:hover {
  color: hsl(var(--destructive));
}·
.hover\\:text-destructive\\/80:hover {
  color: hsl(var(--destructive) / 0.8);
}·
.hover\\:text-foreground:hover {
  color: hsl(var(--foreground));
}·
.hover\\:text-muted-foreground:hover {
  color: hsl(var(--muted-foreground));
}·
.hover\\:text-primary-foreground:hover {
  color: hsl(var(--primary-foreground));
}·
.hover\\:text-red-700:hover {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity, 1));
}·
.hover\\:text-sidebar-accent-foreground:hover {
  color: hsl(var(--sidebar-accent-foreground));
}·
.hover\\:underline:hover {
  text-decoration-line: underline;
}·
.hover\\:opacity-100:hover {
  opacity: 1;
}·
.hover\\:shadow-\\[0_0_0_1px_hsl\\(var\\(--sidebar-accent\\)\\)\\]:hover {
  --tw-shadow: 0 0 0 1px hsl(var(--sidebar-accent));
  --tw-shadow-colored: 0 0 0 1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.hover\\:shadow-md:hover {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.hover\\:shadow-none:hover {
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.hover\\:after\\:bg-sidebar-border:hover::after {
  content: var(--tw-content);
  background-color: hsl(var(--sidebar-border));
}·
.focus\\:bg-accent:focus {
  background-color: hsl(var(--accent));
}·
.focus\\:bg-primary:focus {
  background-color: hsl(var(--primary));
}·
.focus\\:text-accent-foreground:focus {
  color: hsl(var(--accent-foreground));
}·
.focus\\:text-primary-foreground:focus {
  color: hsl(var(--primary-foreground));
}·
.focus\\:opacity-100:focus {
  opacity: 1;
}·
.focus\\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}·
.focus\\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}·
.focus\\:ring-blue-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity, 1));
}·
.focus\\:ring-ring:focus {
  --tw-ring-color: hsl(var(--ring));
}·
.focus\\:ring-slate-400:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(148 163 184 / var(--tw-ring-opacity, 1));
}·
.focus\\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}·
.focus-visible\\:outline-none:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}·
.focus-visible\\:ring-1:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}·
.focus-visible\\:ring-2:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}·
.focus-visible\\:ring-ring:focus-visible {
  --tw-ring-color: hsl(var(--ring));
}·
.focus-visible\\:ring-sidebar-ring:focus-visible {
  --tw-ring-color: hsl(var(--sidebar-ring));
}·
.focus-visible\\:ring-offset-1:focus-visible {
  --tw-ring-offset-width: 1px;
}·
.focus-visible\\:ring-offset-2:focus-visible {
  --tw-ring-offset-width: 2px;
}·
.focus-visible\\:ring-offset-background:focus-visible {
  --tw-ring-offset-color: hsl(var(--background));
}·
.active\\:bg-sidebar-accent:active {
  background-color: hsl(var(--sidebar-accent));
}·
.active\\:text-sidebar-accent-foreground:active {
  color: hsl(var(--sidebar-accent-foreground));
}·
.disabled\\:pointer-events-none:disabled {
  pointer-events: none;
}·
.disabled\\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}·
.disabled\\:opacity-50:disabled {
  opacity: 0.5;
}·
.group\\/menu-item:focus-within .group-focus-within\\/menu-item\\:opacity-100 {
  opacity: 1;
}·
.group\\/menu-item:hover .group-hover\\/menu-item\\:opacity-100 {
  opacity: 1;
}·
.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}·
.group.destructive .group-\\[\\.destructive\\]\\:border-muted\\/40 {
  border-color: hsl(var(--muted) / 0.4);
}·
.group.toaster .group-\\[\\.toaster\\]\\:border-border {
  border-color: hsl(var(--border));
}·
.group.toast .group-\\[\\.toast\\]\\:bg-muted {
  background-color: hsl(var(--muted));
}·
.group.toast .group-\\[\\.toast\\]\\:bg-primary {
  background-color: hsl(var(--primary));
}·
.group.toaster .group-\\[\\.toaster\\]\\:bg-background {
  background-color: hsl(var(--background));
}·
.group.destructive .group-\\[\\.destructive\\]\\:text-red-300 {
  --tw-text-opacity: 1;
  color: rgb(252 165 165 / var(--tw-text-opacity, 1));
}·
.group.toast .group-\\[\\.toast\\]\\:text-muted-foreground {
  color: hsl(var(--muted-foreground));
}·
.group.toast .group-\\[\\.toast\\]\\:text-primary-foreground {
  color: hsl(var(--primary-foreground));
}·
.group.toaster .group-\\[\\.toaster\\]\\:text-foreground {
  color: hsl(var(--foreground));
}·
.group.toaster .group-\\[\\.toaster\\]\\:shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.group.destructive .group-\\[\\.destructive\\]\\:hover\\:border-destructive\\/30:hover {
  border-color: hsl(var(--destructive) / 0.3);
}·
.group.destructive .group-\\[\\.destructive\\]\\:hover\\:bg-destructive:hover {
  background-color: hsl(var(--destructive));
}·
.group.destructive .group-\\[\\.destructive\\]\\:hover\\:text-destructive-foreground:hover {
  color: hsl(var(--destructive-foreground));
}·
.group.destructive .group-\\[\\.destructive\\]\\:hover\\:text-red-50:hover {
  --tw-text-opacity: 1;
  color: rgb(254 242 242 / var(--tw-text-opacity, 1));
}·
.group.destructive .group-\\[\\.destructive\\]\\:focus\\:ring-destructive:focus {
  --tw-ring-color: hsl(var(--destructive));
}·
.group.destructive .group-\\[\\.destructive\\]\\:focus\\:ring-red-400:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(248 113 113 / var(--tw-ring-opacity, 1));
}·
.group.destructive .group-\\[\\.destructive\\]\\:focus\\:ring-offset-red-600:focus {
  --tw-ring-offset-color: #dc2626;
}·
.peer\\/menu-button:hover ~ .peer-hover\\/menu-button\\:text-sidebar-accent-foreground {
  color: hsl(var(--sidebar-accent-foreground));
}·
.peer:disabled ~ .peer-disabled\\:cursor-not-allowed {
  cursor: not-allowed;
}·
.peer:disabled ~ .peer-disabled\\:opacity-70 {
  opacity: 0.7;
}·
.has-\\[\\[data-variant\\=inset\\]\\]\\:bg-sidebar:has([data-variant=inset]) {
  background-color: hsl(var(--sidebar-background));
}·
.has-\\[\\:disabled\\]\\:opacity-50:has(:disabled) {
  opacity: 0.5;
}·
.group\\/menu-item:has([data-sidebar=menu-action]) .group-has-\\[\\[data-sidebar\\=menu-action\\]\\]\\/menu-item\\:pr-8 {
  padding-right: 2rem;
}·
.aria-disabled\\:pointer-events-none[aria-disabled=\"true\"] {
  pointer-events: none;
}·
.aria-disabled\\:opacity-50[aria-disabled=\"true\"] {
  opacity: 0.5;
}·
.aria-selected\\:bg-accent[aria-selected=\"true\"] {
  background-color: hsl(var(--accent));
}·
.aria-selected\\:bg-accent\\/50[aria-selected=\"true\"] {
  background-color: hsl(var(--accent) / 0.5);
}·
.aria-selected\\:text-accent-foreground[aria-selected=\"true\"] {
  color: hsl(var(--accent-foreground));
}·
.aria-selected\\:text-muted-foreground[aria-selected=\"true\"] {
  color: hsl(var(--muted-foreground));
}·
.aria-selected\\:opacity-100[aria-selected=\"true\"] {
  opacity: 1;
}·
.aria-selected\\:opacity-30[aria-selected=\"true\"] {
  opacity: 0.3;
}·
.data-\\[disabled\\=true\\]\\:pointer-events-none[data-disabled=\"true\"] {
  pointer-events: none;
}·
.data-\\[disabled\\]\\:pointer-events-none[data-disabled] {
  pointer-events: none;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:h-px[data-panel-group-direction=\"vertical\"] {
  height: 1px;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:w-full[data-panel-group-direction=\"vertical\"] {
  width: 100%;
}·
.data-\\[side\\=bottom\\]\\:translate-y-1[data-side=\"bottom\"] {
  --tw-translate-y: 0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[side\\=left\\]\\:-translate-x-1[data-side=\"left\"] {
  --tw-translate-x: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[side\\=right\\]\\:translate-x-1[data-side=\"right\"] {
  --tw-translate-x: 0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[side\\=top\\]\\:-translate-y-1[data-side=\"top\"] {
  --tw-translate-y: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[state\\=checked\\]\\:translate-x-5[data-state=\"checked\"] {
  --tw-translate-x: 1.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[state\\=unchecked\\]\\:translate-x-0[data-state=\"unchecked\"] {
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[swipe\\=cancel\\]\\:translate-x-0[data-swipe=\"cancel\"] {
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[swipe\\=end\\]\\:translate-x-\\[var\\(--radix-toast-swipe-end-x\\)\\][data-swipe=\"end\"] {
  --tw-translate-x: var(--radix-toast-swipe-end-x);
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[swipe\\=move\\]\\:translate-x-\\[var\\(--radix-toast-swipe-move-x\\)\\][data-swipe=\"move\"] {
  --tw-translate-x: var(--radix-toast-swipe-move-x);
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
@keyframes accordion-up {·
  from {
    height: var(--radix-accordion-content-height);
  }·
  to {
    height: 0;
  }
}·
.data-\\[state\\=closed\\]\\:animate-accordion-up[data-state=\"closed\"] {
  animation: accordion-up 0.2s ease-out;
}·
@keyframes accordion-down {·
  from {
    height: 0;
  }·
  to {
    height: var(--radix-accordion-content-height);
  }
}·
.data-\\[state\\=open\\]\\:animate-accordion-down[data-state=\"open\"] {
  animation: accordion-down 0.2s ease-out;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:flex-col[data-panel-group-direction=\"vertical\"] {
  flex-direction: column;
}·
.data-\\[active\\=true\\]\\:bg-sidebar-accent[data-active=\"true\"] {
  background-color: hsl(var(--sidebar-accent));
}·
.data-\\[active\\]\\:bg-accent\\/50[data-active] {
  background-color: hsl(var(--accent) / 0.5);
}·
.data-\\[selected\\=\\'true\\'\\]\\:bg-accent[data-selected='true'] {
  background-color: hsl(var(--accent));
}·
.data-\\[state\\=active\\]\\:bg-background[data-state=\"active\"] {
  background-color: hsl(var(--background));
}·
.data-\\[state\\=checked\\]\\:bg-primary[data-state=\"checked\"] {
  background-color: hsl(var(--primary));
}·
.data-\\[state\\=on\\]\\:bg-accent[data-state=\"on\"] {
  background-color: hsl(var(--accent));
}·
.data-\\[state\\=open\\]\\:bg-accent[data-state=\"open\"] {
  background-color: hsl(var(--accent));
}·
.data-\\[state\\=open\\]\\:bg-accent\\/50[data-state=\"open\"] {
  background-color: hsl(var(--accent) / 0.5);
}·
.data-\\[state\\=open\\]\\:bg-secondary[data-state=\"open\"] {
  background-color: hsl(var(--secondary));
}·
.data-\\[state\\=selected\\]\\:bg-muted[data-state=\"selected\"] {
  background-color: hsl(var(--muted));
}·
.data-\\[state\\=unchecked\\]\\:bg-input[data-state=\"unchecked\"] {
  background-color: hsl(var(--input));
}·
.data-\\[active\\=true\\]\\:font-medium[data-active=\"true\"] {
  font-weight: 500;
}·
.data-\\[active\\=true\\]\\:text-sidebar-accent-foreground[data-active=\"true\"] {
  color: hsl(var(--sidebar-accent-foreground));
}·
.data-\\[selected\\=true\\]\\:text-accent-foreground[data-selected=\"true\"] {
  color: hsl(var(--accent-foreground));
}·
.data-\\[state\\=active\\]\\:text-foreground[data-state=\"active\"] {
  color: hsl(var(--foreground));
}·
.data-\\[state\\=checked\\]\\:text-primary-foreground[data-state=\"checked\"] {
  color: hsl(var(--primary-foreground));
}·
.data-\\[state\\=on\\]\\:text-accent-foreground[data-state=\"on\"] {
  color: hsl(var(--accent-foreground));
}·
.data-\\[state\\=open\\]\\:text-accent-foreground[data-state=\"open\"] {
  color: hsl(var(--accent-foreground));
}·
.data-\\[state\\=open\\]\\:text-muted-foreground[data-state=\"open\"] {
  color: hsl(var(--muted-foreground));
}·
.data-\\[disabled\\=true\\]\\:opacity-50[data-disabled=\"true\"] {
  opacity: 0.5;
}·
.data-\\[disabled\\]\\:opacity-50[data-disabled] {
  opacity: 0.5;
}·
.data-\\[state\\=open\\]\\:opacity-100[data-state=\"open\"] {
  opacity: 1;
}·
.data-\\[state\\=active\\]\\:shadow-sm[data-state=\"active\"] {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.data-\\[swipe\\=move\\]\\:transition-none[data-swipe=\"move\"] {
  transition-property: none;
}·
.data-\\[state\\=closed\\]\\:duration-300[data-state=\"closed\"] {
  transition-duration: 300ms;
}·
.data-\\[state\\=open\\]\\:duration-500[data-state=\"open\"] {
  transition-duration: 500ms;
}·
.data-\\[motion\\^\\=from-\\]\\:animate-in[data-motion^=\"from-\"] {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}·
.data-\\[state\\=open\\]\\:animate-in[data-state=\"open\"] {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}·
.data-\\[state\\=visible\\]\\:animate-in[data-state=\"visible\"] {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}·
.data-\\[motion\\^\\=to-\\]\\:animate-out[data-motion^=\"to-\"] {
  animation-name: exit;
  animation-duration: 150ms;
  --tw-exit-opacity: initial;
  --tw-exit-scale: initial;
  --tw-exit-rotate: initial;
  --tw-exit-translate-x: initial;
  --tw-exit-translate-y: initial;
}·
.data-\\[state\\=closed\\]\\:animate-out[data-state=\"closed\"] {
  animation-name: exit;
  animation-duration: 150ms;
  --tw-exit-opacity: initial;
  --tw-exit-scale: initial;
  --tw-exit-rotate: initial;
  --tw-exit-translate-x: initial;
  --tw-exit-translate-y: initial;
}·
.data-\\[state\\=hidden\\]\\:animate-out[data-state=\"hidden\"] {
  animation-name: exit;
  animation-duration: 150ms;
  --tw-exit-opacity: initial;
  --tw-exit-scale: initial;
  --tw-exit-rotate: initial;
  --tw-exit-translate-x: initial;
  --tw-exit-translate-y: initial;
}·
.data-\\[swipe\\=end\\]\\:animate-out[data-swipe=\"end\"] {
  animation-name: exit;
  animation-duration: 150ms;
  --tw-exit-opacity: initial;
  --tw-exit-scale: initial;
  --tw-exit-rotate: initial;
  --tw-exit-translate-x: initial;
  --tw-exit-translate-y: initial;
}·
.data-\\[motion\\^\\=from-\\]\\:fade-in[data-motion^=\"from-\"] {
  --tw-enter-opacity: 0;
}·
.data-\\[motion\\^\\=to-\\]\\:fade-out[data-motion^=\"to-\"] {
  --tw-exit-opacity: 0;
}·
.data-\\[state\\=closed\\]\\:fade-out-0[data-state=\"closed\"] {
  --tw-exit-opacity: 0;
}·
.data-\\[state\\=closed\\]\\:fade-out-80[data-state=\"closed\"] {
  --tw-exit-opacity: 0.8;
}·
.data-\\[state\\=hidden\\]\\:fade-out[data-state=\"hidden\"] {
  --tw-exit-opacity: 0;
}·
.data-\\[state\\=open\\]\\:fade-in-0[data-state=\"open\"] {
  --tw-enter-opacity: 0;
}·
.data-\\[state\\=visible\\]\\:fade-in[data-state=\"visible\"] {
  --tw-enter-opacity: 0;
}·
.data-\\[state\\=closed\\]\\:zoom-out-95[data-state=\"closed\"] {
  --tw-exit-scale: .95;
}·
.data-\\[state\\=open\\]\\:zoom-in-90[data-state=\"open\"] {
  --tw-enter-scale: .9;
}·
.data-\\[state\\=open\\]\\:zoom-in-95[data-state=\"open\"] {
  --tw-enter-scale: .95;
}·
.data-\\[motion\\=from-end\\]\\:slide-in-from-right-52[data-motion=\"from-end\"] {
  --tw-enter-translate-x: 13rem;
}·
.data-\\[motion\\=from-start\\]\\:slide-in-from-left-52[data-motion=\"from-start\"] {
  --tw-enter-translate-x: -13rem;
}·
.data-\\[motion\\=to-end\\]\\:slide-out-to-right-52[data-motion=\"to-end\"] {
  --tw-exit-translate-x: 13rem;
}·
.data-\\[motion\\=to-start\\]\\:slide-out-to-left-52[data-motion=\"to-start\"] {
  --tw-exit-translate-x: -13rem;
}·
.data-\\[side\\=bottom\\]\\:slide-in-from-top-2[data-side=\"bottom\"] {
  --tw-enter-translate-y: -0.5rem;
}·
.data-\\[side\\=left\\]\\:slide-in-from-right-2[data-side=\"left\"] {
  --tw-enter-translate-x: 0.5rem;
}·
.data-\\[side\\=right\\]\\:slide-in-from-left-2[data-side=\"right\"] {
  --tw-enter-translate-x: -0.5rem;
}·
.data-\\[side\\=top\\]\\:slide-in-from-bottom-2[data-side=\"top\"] {
  --tw-enter-translate-y: 0.5rem;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-bottom[data-state=\"closed\"] {
  --tw-exit-translate-y: 100%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-left[data-state=\"closed\"] {
  --tw-exit-translate-x: -100%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-left-1\\/2[data-state=\"closed\"] {
  --tw-exit-translate-x: -50%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-right[data-state=\"closed\"] {
  --tw-exit-translate-x: 100%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-right-full[data-state=\"closed\"] {
  --tw-exit-translate-x: 100%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-top[data-state=\"closed\"] {
  --tw-exit-translate-y: -100%;
}·
.data-\\[state\\=closed\\]\\:slide-out-to-top-\\[48\\%\\][data-state=\"closed\"] {
  --tw-exit-translate-y: -48%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-bottom[data-state=\"open\"] {
  --tw-enter-translate-y: 100%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-left[data-state=\"open\"] {
  --tw-enter-translate-x: -100%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-left-1\\/2[data-state=\"open\"] {
  --tw-enter-translate-x: -50%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-right[data-state=\"open\"] {
  --tw-enter-translate-x: 100%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-top[data-state=\"open\"] {
  --tw-enter-translate-y: -100%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-top-\\[48\\%\\][data-state=\"open\"] {
  --tw-enter-translate-y: -48%;
}·
.data-\\[state\\=open\\]\\:slide-in-from-top-full[data-state=\"open\"] {
  --tw-enter-translate-y: -100%;
}·
.data-\\[state\\=closed\\]\\:duration-300[data-state=\"closed\"] {
  animation-duration: 300ms;
}·
.data-\\[state\\=open\\]\\:duration-500[data-state=\"open\"] {
  animation-duration: 500ms;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:after\\:left-0[data-panel-group-direction=\"vertical\"]::after {
  content: var(--tw-content);
  left: 0px;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:after\\:h-1[data-panel-group-direction=\"vertical\"]::after {
  content: var(--tw-content);
  height: 0.25rem;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:after\\:w-full[data-panel-group-direction=\"vertical\"]::after {
  content: var(--tw-content);
  width: 100%;
}·
.data-\\[panel-group-direction\\=vertical\\]\\:after\\:-translate-y-1\\/2[data-panel-group-direction=\"vertical\"]::after {
  content: var(--tw-content);
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[panel-group-direction\\=vertical\\]\\:after\\:translate-x-0[data-panel-group-direction=\"vertical\"]::after {
  content: var(--tw-content);
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.data-\\[state\\=open\\]\\:hover\\:bg-sidebar-accent:hover[data-state=\"open\"] {
  background-color: hsl(var(--sidebar-accent));
}·
.data-\\[state\\=open\\]\\:hover\\:text-sidebar-accent-foreground:hover[data-state=\"open\"] {
  color: hsl(var(--sidebar-accent-foreground));
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:left-\\[calc\\(var\\(--sidebar-width\\)\\*-1\\)\\] {
  left: calc(var(--sidebar-width) * -1);
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:right-\\[calc\\(var\\(--sidebar-width\\)\\*-1\\)\\] {
  right: calc(var(--sidebar-width) * -1);
}·
.group[data-side=\"left\"] .group-data-\\[side\\=left\\]\\:-right-4 {
  right: -1rem;
}·
.group[data-side=\"right\"] .group-data-\\[side\\=right\\]\\:left-0 {
  left: 0px;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:-mt-8 {
  margin-top: -2rem;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:hidden {
  display: none;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:\\!size-8 {
  width: 2rem !important;
  height: 2rem !important;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:w-\\[--sidebar-width-icon\\] {
  width: var(--sidebar-width-icon);
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:w-\\[calc\\(var\\(--sidebar-width-icon\\)_\\+_theme\\(spacing\\.4\\)\\)\\] {
  width: calc(var(--sidebar-width-icon) + 1rem);
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:w-\\[calc\\(var\\(--sidebar-width-icon\\)_\\+_theme\\(spacing\\.4\\)_\\+2px\\)\\] {
  width: calc(var(--sidebar-width-icon) + 1rem + 2px);
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:w-0 {
  width: 0px;
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:translate-x-0 {
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.group[data-side=\"right\"] .group-data-\\[side\\=right\\]\\:rotate-180 {
  --tw-rotate: 180deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.group[data-state=\"open\"] .group-data-\\[state\\=open\\]\\:rotate-180 {
  --tw-rotate: 180deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:overflow-hidden {
  overflow: hidden;
}·
.group[data-variant=\"floating\"] .group-data-\\[variant\\=floating\\]\\:rounded-lg {
  border-radius: var(--radius);
}·
.group[data-variant=\"floating\"] .group-data-\\[variant\\=floating\\]\\:border {
  border-width: 1px;
}·
.group[data-side=\"left\"] .group-data-\\[side\\=left\\]\\:border-r {
  border-right-width: 1px;
}·
.group[data-side=\"right\"] .group-data-\\[side\\=right\\]\\:border-l {
  border-left-width: 1px;
}·
.group[data-variant=\"floating\"] .group-data-\\[variant\\=floating\\]\\:border-sidebar-border {
  border-color: hsl(var(--sidebar-border));
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:\\!p-0 {
  padding: 0px !important;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:\\!p-2 {
  padding: 0.5rem !important;
}·
.group[data-collapsible=\"icon\"] .group-data-\\[collapsible\\=icon\\]\\:opacity-0 {
  opacity: 0;
}·
.group[data-variant=\"floating\"] .group-data-\\[variant\\=floating\\]\\:shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:after\\:left-full::after {
  content: var(--tw-content);
  left: 100%;
}·
.group[data-collapsible=\"offcanvas\"] .group-data-\\[collapsible\\=offcanvas\\]\\:hover\\:bg-sidebar:hover {
  background-color: hsl(var(--sidebar-background));
}·
.peer\\/menu-button[data-size=\"default\"] ~ .peer-data-\\[size\\=default\\]\\/menu-button\\:top-1\\.5 {
  top: 0.375rem;
}·
.peer\\/menu-button[data-size=\"lg\"] ~ .peer-data-\\[size\\=lg\\]\\/menu-button\\:top-2\\.5 {
  top: 0.625rem;
}·
.peer\\/menu-button[data-size=\"sm\"] ~ .peer-data-\\[size\\=sm\\]\\/menu-button\\:top-1 {
  top: 0.25rem;
}·
.peer[data-variant=\"inset\"] ~ .peer-data-\\[variant\\=inset\\]\\:min-h-\\[calc\\(100svh-theme\\(spacing\\.4\\)\\)\\] {
  min-height: calc(100svh - 1rem);
}·
.peer\\/menu-button[data-active=\"true\"] ~ .peer-data-\\[active\\=true\\]\\/menu-button\\:text-sidebar-accent-foreground {
  color: hsl(var(--sidebar-accent-foreground));
}·
.prose-p\\:my-2 :is(:where(p):not(:where([class~=\"not-prose\"],[class~=\"not-prose\"] *))) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}·
.dark\\:border-amber-700:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(180 83 9 / var(--tw-border-opacity, 1));
}·
.dark\\:border-amber-800\\/30:is(.dark *) {
  border-color: rgb(146 64 14 / 0.3);
}·
.dark\\:border-destructive:is(.dark *) {
  border-color: hsl(var(--destructive));
}·
.dark\\:border-gray-700:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(55 65 81 / var(--tw-border-opacity, 1));
}·
.dark\\:border-red-700:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(185 28 28 / var(--tw-border-opacity, 1));
}·
.dark\\:border-red-800\\/30:is(.dark *) {
  border-color: rgb(153 27 27 / 0.3);
}·
.dark\\:border-slate-600:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(71 85 105 / var(--tw-border-opacity, 1));
}·
.dark\\:border-slate-700:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(51 65 85 / var(--tw-border-opacity, 1));
}·
.dark\\:bg-amber-800\\/50:is(.dark *) {
  background-color: rgb(146 64 14 / 0.5);
}·
.dark\\:bg-amber-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(120 53 15 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-amber-900\\/10:is(.dark *) {
  background-color: rgb(120 53 15 / 0.1);
}·
.dark\\:bg-amber-900\\/90:is(.dark *) {
  background-color: rgb(120 53 15 / 0.9);
}·
.dark\\:bg-blue-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(29 78 216 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-cyan-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(14 116 144 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-orange-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(194 65 12 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-purple-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(126 34 206 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-red-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(185 28 28 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-red-800\\/50:is(.dark *) {
  background-color: rgb(153 27 27 / 0.5);
}·
.dark\\:bg-red-900\\/10:is(.dark *) {
  background-color: rgb(127 29 29 / 0.1);
}·
.dark\\:bg-red-900\\/90:is(.dark *) {
  background-color: rgb(127 29 29 / 0.9);
}·
.dark\\:bg-slate-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(51 65 85 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-slate-800:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(30 41 59 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-slate-800\\/95:is(.dark *) {
  background-color: rgb(30 41 59 / 0.95);
}·
.dark\\:bg-slate-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity, 1));
}·
.dark\\:bg-slate-900\\/10:is(.dark *) {
  background-color: rgb(15 23 42 / 0.1);
}·
.dark\\:text-amber-200:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(253 230 138 / var(--tw-text-opacity, 1));
}·
.dark\\:text-amber-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(252 211 77 / var(--tw-text-opacity, 1));
}·
.dark\\:text-blue-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(219 234 254 / var(--tw-text-opacity, 1));
}·
.dark\\:text-cyan-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(207 250 254 / var(--tw-text-opacity, 1));
}·
.dark\\:text-gray-400:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(156 163 175 / var(--tw-text-opacity, 1));
}·
.dark\\:text-gray-600:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(75 85 99 / var(--tw-text-opacity, 1));
}·
.dark\\:text-orange-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(255 237 213 / var(--tw-text-opacity, 1));
}·
.dark\\:text-purple-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(243 232 255 / var(--tw-text-opacity, 1));
}·
.dark\\:text-red-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(254 226 226 / var(--tw-text-opacity, 1));
}·
.dark\\:text-red-200:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(254 202 202 / var(--tw-text-opacity, 1));
}·
.dark\\:text-red-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(252 165 165 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(241 245 249 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-200:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(226 232 240 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(203 213 225 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-400:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(148 163 184 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-50:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}·
.dark\\:text-slate-500:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(100 116 139 / var(--tw-text-opacity, 1));
}·
.dark\\:hover\\:bg-red-700:hover:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(185 28 28 / var(--tw-bg-opacity, 1));
}·
.dark\\:hover\\:bg-slate-600:hover:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(71 85 105 / var(--tw-bg-opacity, 1));
}·
.dark\\:hover\\:bg-slate-700:hover:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(51 65 85 / var(--tw-bg-opacity, 1));
}·
.dark\\:focus\\:ring-slate-500:focus:is(.dark *) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(100 116 139 / var(--tw-ring-opacity, 1));
}·
@media (min-width: 640px) {·
  .sm\\:bottom-0 {
    bottom: 0px;
  }·
  .sm\\:right-0 {
    right: 0px;
  }·
  .sm\\:top-auto {
    top: auto;
  }·
  .sm\\:mb-0 {
    margin-bottom: 0px;
  }·
  .sm\\:mt-0 {
    margin-top: 0px;
  }·
  .sm\\:flex {
    display: flex;
  }·
  .sm\\:max-w-\\[425px\\] {
    max-width: 425px;
  }·
  .sm\\:max-w-\\[600px\\] {
    max-width: 600px;
  }·
  .sm\\:max-w-\\[700px\\] {
    max-width: 700px;
  }·
  .sm\\:max-w-lg {
    max-width: 32rem;
  }·
  .sm\\:max-w-sm {
    max-width: 24rem;
  }·
  .sm\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }·
  .sm\\:flex-row {
    flex-direction: row;
  }·
  .sm\\:flex-col {
    flex-direction: column;
  }·
  .sm\\:items-center {
    align-items: center;
  }·
  .sm\\:justify-end {
    justify-content: flex-end;
  }·
  .sm\\:gap-2\\.5 {
    gap: 0.625rem;
  }·
  .sm\\:space-x-2 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-x-reverse: 0;
    margin-right: calc(0.5rem * var(--tw-space-x-reverse));
    margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
  }·
  .sm\\:space-x-4 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-x-reverse: 0;
    margin-right: calc(1rem * var(--tw-space-x-reverse));
    margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
  }·
  .sm\\:space-y-0 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0px * var(--tw-space-y-reverse));
  }·
  .sm\\:rounded-lg {
    border-radius: var(--radius);
  }·
  .sm\\:text-left {
    text-align: left;
  }·
  .data-\\[state\\=open\\]\\:sm\\:slide-in-from-bottom-full[data-state=\"open\"] {
    --tw-enter-translate-y: 100%;
  }
}·
@media (min-width: 768px) {·
  .md\\:absolute {
    position: absolute;
  }·
  .md\\:bottom-4 {
    bottom: 1rem;
  }·
  .md\\:block {
    display: block;
  }·
  .md\\:flex {
    display: flex;
  }·
  .md\\:w-\\[var\\(--radix-navigation-menu-viewport-width\\)\\] {
    width: var(--radix-navigation-menu-viewport-width);
  }·
  .md\\:w-auto {
    width: auto;
  }·
  .md\\:max-w-2xl {
    max-width: 42rem;
  }·
  .md\\:max-w-\\[420px\\] {
    max-width: 420px;
  }·
  .md\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }·
  .md\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }·
  .md\\:p-4 {
    padding: 1rem;
  }·
  .md\\:pb-0 {
    padding-bottom: 0px;
  }·
  .md\\:text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }·
  .md\\:opacity-0 {
    opacity: 0;
  }·
  .after\\:md\\:hidden::after {
    content: var(--tw-content);
    display: none;
  }·
  .peer[data-variant=\"inset\"] ~ .md\\:peer-data-\\[variant\\=inset\\]\\:m-2 {
    margin: 0.5rem;
  }·
  .peer[data-state=\"collapsed\"][data-variant=\"inset\"] ~ .md\\:peer-data-\\[state\\=collapsed\\]\\:peer-data-\\[variant\\=inset\\]\\:ml-2 {
    margin-left: 0.5rem;
  }·
  .peer[data-variant=\"inset\"] ~ .md\\:peer-data-\\[variant\\=inset\\]\\:ml-0 {
    margin-left: 0px;
  }·
  .peer[data-variant=\"inset\"] ~ .md\\:peer-data-\\[variant\\=inset\\]\\:rounded-xl {
    border-radius: 0.75rem;
  }·
  .peer[data-variant=\"inset\"] ~ .md\\:peer-data-\\[variant\\=inset\\]\\:shadow {
    --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
}·
@media (min-width: 1024px) {·
  .lg\\:flex {
    display: flex;
  }·
  .lg\\:max-w-4xl {
    max-width: 56rem;
  }·
  .lg\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}·
.\\[\\&\\:has\\(\\[aria-selected\\]\\)\\]\\:bg-accent:has([aria-selected]) {
  background-color: hsl(var(--accent));
}·
.first\\:\\[\\&\\:has\\(\\[aria-selected\\]\\)\\]\\:rounded-l-md:has([aria-selected]):first-child {
  border-top-left-radius: calc(var(--radius) - 2px);
  border-bottom-left-radius: calc(var(--radius) - 2px);
}·
.last\\:\\[\\&\\:has\\(\\[aria-selected\\]\\)\\]\\:rounded-r-md:has([aria-selected]):last-child {
  border-top-right-radius: calc(var(--radius) - 2px);
  border-bottom-right-radius: calc(var(--radius) - 2px);
}·
.\\[\\&\\:has\\(\\[aria-selected\\]\\.day-outside\\)\\]\\:bg-accent\\/50:has([aria-selected].day-outside) {
  background-color: hsl(var(--accent) / 0.5);
}·
.\\[\\&\\:has\\(\\[aria-selected\\]\\.day-range-end\\)\\]\\:rounded-r-md:has([aria-selected].day-range-end) {
  border-top-right-radius: calc(var(--radius) - 2px);
  border-bottom-right-radius: calc(var(--radius) - 2px);
}·
.\\[\\&\\:has\\(\\[role\\=checkbox\\]\\)\\]\\:pr-0:has([role=checkbox]) {
  padding-right: 0px;
}·
.\\[\\&\\>button\\]\\:hidden>button {
  display: none;
}·
.\\[\\&\\>span\\:last-child\\]\\:truncate>span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}·
.\\[\\&\\>span\\]\\:line-clamp-1>span {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}·
.\\[\\&\\>svg\\+div\\]\\:translate-y-\\[-3px\\]>svg+div {
  --tw-translate-y: -3px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.\\[\\&\\>svg\\]\\:absolute>svg {
  position: absolute;
}·
.\\[\\&\\>svg\\]\\:left-4>svg {
  left: 1rem;
}·
.\\[\\&\\>svg\\]\\:top-4>svg {
  top: 1rem;
}·
.\\[\\&\\>svg\\]\\:size-3\\.5>svg {
  width: 0.875rem;
  height: 0.875rem;
}·
.\\[\\&\\>svg\\]\\:size-4>svg {
  width: 1rem;
  height: 1rem;
}·
.\\[\\&\\>svg\\]\\:h-2\\.5>svg {
  height: 0.625rem;
}·
.\\[\\&\\>svg\\]\\:h-3>svg {
  height: 0.75rem;
}·
.\\[\\&\\>svg\\]\\:w-2\\.5>svg {
  width: 0.625rem;
}·
.\\[\\&\\>svg\\]\\:w-3>svg {
  width: 0.75rem;
}·
.\\[\\&\\>svg\\]\\:shrink-0>svg {
  flex-shrink: 0;
}·
.\\[\\&\\>svg\\]\\:text-destructive>svg {
  color: hsl(var(--destructive));
}·
.\\[\\&\\>svg\\]\\:text-foreground>svg {
  color: hsl(var(--foreground));
}·
.\\[\\&\\>svg\\]\\:text-muted-foreground>svg {
  color: hsl(var(--muted-foreground));
}·
.\\[\\&\\>svg\\]\\:text-sidebar-accent-foreground>svg {
  color: hsl(var(--sidebar-accent-foreground));
}·
.\\[\\&\\>svg\\~\\*\\]\\:pl-7>svg~* {
  padding-left: 1.75rem;
}·
.\\[\\&\\>tr\\]\\:last\\:border-b-0:last-child>tr {
  border-bottom-width: 0px;
}·
.\\[\\&\\[data-panel-group-direction\\=vertical\\]\\>div\\]\\:rotate-90[data-panel-group-direction=vertical]>div {
  --tw-rotate: 90deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.\\[\\&\\[data-state\\=open\\]\\>svg\\]\\:rotate-180[data-state=open]>svg {
  --tw-rotate: 180deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}·
.\\[\\&_\\.recharts-cartesian-axis-tick_text\\]\\:fill-muted-foreground .recharts-cartesian-axis-tick text {
  fill: hsl(var(--muted-foreground));
}·
.\\[\\&_\\.recharts-cartesian-grid_line\\[stroke\\=\\'\\#ccc\\'\\]\\]\\:stroke-border\\/50 .recharts-cartesian-grid line[stroke='#ccc'] {
  stroke: hsl(var(--border) / 0.5);
}·
.\\[\\&_\\.recharts-curve\\.recharts-tooltip-cursor\\]\\:stroke-border .recharts-curve.recharts-tooltip-cursor {
  stroke: hsl(var(--border));
}·
.\\[\\&_\\.recharts-dot\\[stroke\\=\\'\\#fff\\'\\]\\]\\:stroke-transparent .recharts-dot[stroke='#fff'] {
  stroke: transparent;
}·
.\\[\\&_\\.recharts-layer\\]\\:outline-none .recharts-layer {
  outline: 2px solid transparent;
  outline-offset: 2px;
}·
.\\[\\&_\\.recharts-polar-grid_\\[stroke\\=\\'\\#ccc\\'\\]\\]\\:stroke-border .recharts-polar-grid [stroke='#ccc'] {
  stroke: hsl(var(--border));
}·
.\\[\\&_\\.recharts-radial-bar-background-sector\\]\\:fill-muted .recharts-radial-bar-background-sector {
  fill: hsl(var(--muted));
}·
.\\[\\&_\\.recharts-rectangle\\.recharts-tooltip-cursor\\]\\:fill-muted .recharts-rectangle.recharts-tooltip-cursor {
  fill: hsl(var(--muted));
}·
.\\[\\&_\\.recharts-reference-line_\\[stroke\\=\\'\\#ccc\\'\\]\\]\\:stroke-border .recharts-reference-line [stroke='#ccc'] {
  stroke: hsl(var(--border));
}·
.\\[\\&_\\.recharts-sector\\[stroke\\=\\'\\#fff\\'\\]\\]\\:stroke-transparent .recharts-sector[stroke='#fff'] {
  stroke: transparent;
}·
.\\[\\&_\\.recharts-sector\\]\\:outline-none .recharts-sector {
  outline: 2px solid transparent;
  outline-offset: 2px;
}·
.\\[\\&_\\.recharts-surface\\]\\:outline-none .recharts-surface {
  outline: 2px solid transparent;
  outline-offset: 2px;
}·
.\\[\\&_\\[cmdk-group-heading\\]\\]\\:px-2 [cmdk-group-heading] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}·
.\\[\\&_\\[cmdk-group-heading\\]\\]\\:py-1\\.5 [cmdk-group-heading] {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}·
.\\[\\&_\\[cmdk-group-heading\\]\\]\\:text-xs [cmdk-group-heading] {
  font-size: 0.75rem;
  line-height: 1rem;
}·
.\\[\\&_\\[cmdk-group-heading\\]\\]\\:font-medium [cmdk-group-heading] {
  font-weight: 500;
}·
.\\[\\&_\\[cmdk-group-heading\\]\\]\\:text-muted-foreground [cmdk-group-heading] {
  color: hsl(var(--muted-foreground));
}·
.\\[\\&_\\[cmdk-group\\]\\:not\\(\\[hidden\\]\\)_\\~\\[cmdk-group\\]\\]\\:pt-0 [cmdk-group]:not([hidden]) ~[cmdk-group] {
  padding-top: 0px;
}·
.\\[\\&_\\[cmdk-group\\]\\]\\:px-2 [cmdk-group] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}·
.\\[\\&_\\[cmdk-input-wrapper\\]_svg\\]\\:h-5 [cmdk-input-wrapper] svg {
  height: 1.25rem;
}·
.\\[\\&_\\[cmdk-input-wrapper\\]_svg\\]\\:w-5 [cmdk-input-wrapper] svg {
  width: 1.25rem;
}·
.\\[\\&_\\[cmdk-input\\]\\]\\:h-12 [cmdk-input] {
  height: 3rem;
}·
.\\[\\&_\\[cmdk-item\\]\\]\\:px-2 [cmdk-item] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}·
.\\[\\&_\\[cmdk-item\\]\\]\\:py-3 [cmdk-item] {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}·
.\\[\\&_\\[cmdk-item\\]_svg\\]\\:h-5 [cmdk-item] svg {
  height: 1.25rem;
}·
.\\[\\&_\\[cmdk-item\\]_svg\\]\\:w-5 [cmdk-item] svg {
  width: 1.25rem;
}·
.\\[\\&_p\\]\\:leading-relaxed p {
  line-height: 1.625;
}·
.\\[\\&_tr\\:last-child\\]\\:border-0 tr:last-child {
  border-width: 0px;
}·
.\\[\\&_tr\\]\\:border-b tr {
  border-bottom-width: 1px;
}·
[data-side=left][data-collapsible=offcanvas] .\\[\\[data-side\\=left\\]\\[data-collapsible\\=offcanvas\\]_\\&\\]\\:-right-2 {
  right: -0.5rem;
}·
[data-side=left][data-state=collapsed] .\\[\\[data-side\\=left\\]\\[data-state\\=collapsed\\]_\\&\\]\\:cursor-e-resize {
  cursor: e-resize;
}·
[data-side=left] .\\[\\[data-side\\=left\\]_\\&\\]\\:cursor-w-resize {
  cursor: w-resize;
}·
[data-side=right][data-collapsible=offcanvas] .\\[\\[data-side\\=right\\]\\[data-collapsible\\=offcanvas\\]_\\&\\]\\:-left-2 {
  left: -0.5rem;
}·
[data-side=right][data-state=collapsed] .\\[\\[data-side\\=right\\]\\[data-state\\=collapsed\\]_\\&\\]\\:cursor-w-resize {
  cursor: w-resize;
}·
[data-side=right] .\\[\\[data-side\\=right\\]_\\&\\]\\:cursor-e-resize {
  cursor: e-resize;
}
</style></head>·
  <body>
    <div id=\"root\"> <div role=\"region\" aria-label=\"Notifications (F8)\" tabindex=\"-1\" style=\"pointer-events: none;\"><ol tabindex=\"-1\" class=\"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]\"></ol></div><section aria-label=\"Notifications alt+T\" tabindex=\"-1\" aria-live=\"polite\" aria-relevant=\"additions text\" aria-atomic=\"false\"></section><div class=\"min-h-screen flex items-center justify-center bg-gray-100\"><div class=\"text-center\"><h1 class=\"text-4xl font-bold mb-4\">404</h1><p class=\"text-xl text-gray-600 mb-4\">Oops! Page not found</p><a href=\"/\" class=\"text-blue-500 hover:text-blue-700 underline\">Return to Home</a></div></div></div>
    <!-- IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! -->
    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>
    <script type=\"module\" src=\"/src/main.tsx\"></script>····
</body></html>"
    at /Users/freedommarketing/Desktop/effort-flow-planner/tests/examples/basicSeedingExample.spec.ts:71:21
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- heading "404" [level=1]
- paragraph: Oops! Page not found
- link "Return to Home":
  - /url: /
```

# Test source

```ts
   1 | /**
   2 |  * Basic task seeding example with minimal UI interactions
   3 |  * 
   4 |  * This test demonstrates how to:
   5 |  * 1. Create test tasks with different properties
   6 |  * 2. Verify they exist in the database
   7 |  * 3. Clean up test data automatically
   8 |  */
   9 | import { test, expect } from '@playwright/test';
  10 | import { 
  11 |   seedTemplateTask, 
  12 |   seedTemplateTasks, 
  13 |   TestTaskTemplate, 
  14 |   cleanupTestTasks 
  15 | } from '../utils/testDataSeeder';
  16 |
  17 | test.describe('Basic task seeding example', () => {
  18 |   // Clean up any test tasks before starting
  19 |   test.beforeAll(async () => {
  20 |     console.log('Cleaning up any existing test tasks');
  21 |     await cleanupTestTasks();
  22 |   });
  23 |   
  24 |   // Clean up after all tests
  25 |   test.afterAll(async () => {
  26 |     console.log('Final cleanup of test tasks');
  27 |     await cleanupTestTasks();
  28 |   });
  29 |   
  30 |   // Create and verify test tasks exist
  31 |   test('should create different types of tasks successfully', async ({ page }) => {
  32 |     // Create test tasks with different properties using templates
  33 |     console.log('Creating test tasks...');
  34 |     
  35 |     // Basic task
  36 |     const basicTask = await seedTemplateTask(TestTaskTemplate.BASIC, 'Basic Test Task');
  37 |     console.log(`Created basic task with ID: ${basicTask.id}`);
  38 |     
  39 |     // High priority task
  40 |     const highPriorityTask = await seedTemplateTask(TestTaskTemplate.HIGH_PRIORITY, 'High Priority Task');
  41 |     console.log(`Created high priority task with ID: ${highPriorityTask.id}`);
  42 |     
  43 |     // Completed task
  44 |     const completedTask = await seedTemplateTask(TestTaskTemplate.COMPLETED, 'Completed Task');
  45 |     console.log(`Created completed task with ID: ${completedTask.id}`);
  46 |     
  47 |     // Due today task
  48 |     const dueTodayTask = await seedTemplateTask(TestTaskTemplate.DUE_TODAY, 'Due Today Task');
  49 |     console.log(`Created due today task with ID: ${dueTodayTask.id}`);
  50 |     
  51 |     // Create multiple tasks of the same type
  52 |     const tasks = await seedTemplateTasks(TestTaskTemplate.BASIC, 3, 'Batch Task');
  53 |     console.log(`Created ${tasks.length} batch tasks`);
  54 |     
  55 |     // Navigate to the tasks page to see if tasks appear in the UI
  56 |     console.log('Navigating to tasks page...');
  57 |     await page.goto('/tasks');
  58 |     
  59 |     // Take a screenshot of the tasks page
  60 |     await page.screenshot({ path: 'tests/examples/seeded-tasks.png' });
  61 |     
  62 |     // Simple verification that tasks are displayed (adjust selectors as needed)
  63 |     const content = await page.content();
  64 |     
  65 |     // Verify tasks are in the page content
  66 |     // Using console.log for debugging
  67 |     console.log('Checking if tasks appear in page content...');
  68 |     console.log(`Task titles on page: ${content.includes(basicTask.title)}, ${content.includes(highPriorityTask.title)}`);
  69 |     
  70 |     // Just verify that at least one task is visible on the page
> 71 |     expect(content).toContain('Test Task');
     |                     ^ Error: expect(received).toContain(expected) // indexOf
  72 |   });
  73 | });
  74 |
```