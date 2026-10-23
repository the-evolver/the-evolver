# Generates assets/typing-header.svg (typing animation, no external service).
# Usage: python3 typing_header.py ../../assets/typing-header.svg
import sys
lines = ["Backend Software Engineer — Java · Spring Boot · AWS","AIR 6 — CodeChef Long Challenge","Global Rank 51 — LeetCode Weekly 472","Building Distributed Systems at Scale"]
W,H,FS = 800,150,20
CW = 12.0          # forced char width (textLength) so clipping is exact in any font
LH = 32            # line spacing
TYPE, PAUSE, HOLD, GAP = 3.0, 0.25, 2.0, 0.6
T = len(lines)*(TYPE+PAUSE) + HOLD + GAP
top = (H - LH*len(lines))/2 + LH*0.72
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       '<style>text{font-family:"JetBrains Mono",Consolas,Menlo,"DejaVu Sans Mono",monospace;font-weight:600;font-size:%dpx;fill:#58A6FF;white-space:pre}</style>' % FS,
       '<defs>']
body=[]
def esc(s): return s.replace("&","&amp;").replace("<","&lt;")
for i,s in enumerate(lines):
    n=len(s); w=n*CW; x0=(W-w)/2; y=top+i*LH
    start=i*(TYPE+PAUSE); per=TYPE/n
    kt=[0.0]; vals=[0]
    if start>0: kt.append(start/T); vals.append(0)
    for k in range(1,n+1):
        kt.append((start+k*per)/T); vals.append(k*CW)
    end=(len(lines)*(TYPE+PAUSE)+HOLD)/T
    kt.append(end); vals.append(0)
    # dedupe/monotonic
    pairs=[]
    for a,b in zip(kt,vals):
        if pairs and abs(pairs[-1][0]-a)<1e-9: pairs[-1]=(a,b)
        else: pairs.append((a,b))
    kts=";".join(f"{a:.5f}" for a,_ in pairs); vs=";".join(f"{b:.1f}" for _,b in pairs)
    out.append(f'<clipPath id="c{i}"><rect x="{x0:.1f}" y="{y-FS:.1f}" height="{FS*1.5}" width="0">'
               f'<animate attributeName="width" dur="{T:.2f}s" repeatCount="indefinite" calcMode="discrete" keyTimes="{kts}" values="{vs}"/></rect></clipPath>')
    body.append(f'<text x="{x0:.1f}" y="{y:.1f}" textLength="{w:.1f}" lengthAdjust="spacingAndGlyphs" clip-path="url(#c{i})">{esc(s)}</text>')
    # cursor: visible only while this line is typing/paused (and on last line during hold)
    cx=[]; ck=[]
    vis_end = start+TYPE+PAUSE if i<len(lines)-1 else end*T
    ck=[0.0]; cx=["hidden"]
    ck.append(start/T if start>0 else 0.0); cx.append("visible")
    ck.append(vis_end/T); cx.append("hidden")
    pp=[]
    for a,b in zip(ck,cx):
        if pp and abs(pp[-1][0]-a)<1e-9: pp[-1]=(a,b)
        else: pp.append((a,b))
    xs=[(0.0,x0)]
    for k in range(1,n+1): xs.append(((start+k*per)/T, x0+k*CW))
    xp=[]
    for a,b in xs:
        if xp and abs(xp[-1][0]-a)<1e-9: xp[-1]=(a,b)
        else: xp.append((a,b))
    body.append(f'<rect y="{y-FS*0.85:.1f}" width="2" height="{FS*1.05}" fill="#58A6FF" x="{x0:.1f}" visibility="hidden">'
        f'<animate attributeName="x" dur="{T:.2f}s" repeatCount="indefinite" calcMode="discrete" keyTimes="{";".join(f"{a:.5f}" for a,_ in xp)}" values="{";".join(f"{b:.1f}" for _,b in xp)}"/>'
        f'<animate attributeName="visibility" dur="{T:.2f}s" repeatCount="indefinite" calcMode="discrete" keyTimes="{";".join(f"{a:.5f}" for a,_ in pp)}" values="{";".join(b for _,b in pp)}"/>'
        f'<animate attributeName="opacity" dur="0.8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.5" values="1;0"/></rect>')
out.append('</defs>'); out+=body; out.append('</svg>')
open(sys.argv[1] if len(sys.argv)>1 else "typing-header.svg","w").write("\n".join(out))
