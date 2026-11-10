"""Serve out/ the way Netlify serves it, so the preview is worth trusting.

    python scripts/preview-server.py [port] [directory]

`next build` with `output: "export"` writes /fr as fr.html and
/hidden-report-card as hidden-report-card.html, with a directory of the same
name holding the route's data files. A plain `python -m http.server` therefore
answers /fr with a directory listing, and only /fr.html reaches the page. Two
things go wrong when the preview is read at those .html addresses:

  - The footer and the nav read the locale from the path. "/fr.html" is not
    "/fr", so after hydration the French pages show the English footer, with a
    link to the English Terms. On Netlify the URL is "/fr" and the footer is
    French. Checked against the live site, 2 November 2026.
  - Clicking a link in the preview goes to "/hidden-report-card", which the
    plain server cannot serve, so navigation cannot be tested at all.

This serves the static export with Netlify's pretty URLs: an extensionless path
tries <path>.html, then <path>/index.html. A miss gets 404.html with a real 404
status, which is what netlify.toml's catch-all does. It also honours the one
redirect in netlify.toml, /terms, so that link can be clicked here too.

Preview only. Nothing here runs in production, and the published site is served
by Netlify.
"""
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def redirects():
    """The 301s from netlify.toml, read rather than copied.

    This was a one-line dict holding /terms until 9 November 2026, when the
    product page moved to /the-truer-measure and the preview went on serving
    404s for the old pair while the live site redirected them correctly. A
    preview that disagrees with production about routing is worse than no
    preview, because it is believed.

    Only the simple literal rules are taken. The wildcard ones (/build/*, and
    the catch-all to 404.html) are left to the 404 handling below, which
    already does what the catch-all does.
    """
    toml = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "netlify.toml")
    try:
        with open(toml, encoding="utf-8") as f:
            src = f.read()
    except OSError:
        return {"/terms": "/terms-of-service"}
    found = {}
    for block in re.findall(r"\[\[redirects\]\](.*?)(?=\n\[|\Z)", src, re.S):
        frm = re.search(r'from\s*=\s*"([^"]+)"', block)
        to = re.search(r'to\s*=\s*"([^"]+)"', block)
        status = re.search(r"status\s*=\s*(\d+)", block)
        if not (frm and to and status):
            continue
        if status.group(1) != "301" or "*" in frm.group(1):
            continue
        found[frm.group(1)] = to.group(1)
    return found


REDIRECTS = redirects()


class Netlifyish(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]

        target = REDIRECTS.get(path.rstrip("/") or "/")
        if target:
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return None

        local = self.translate_path(self.path)
        if not os.path.isfile(local) and not path.endswith("/"):
            # Pairs rather than string matching: on Windows the filesystem
            # candidate uses backslashes and the URL does not, so comparing the
            # two sends every pretty URL to the 404 page.
            candidates = (
                (local + ".html", path + ".html"),
                (os.path.join(local, "index.html"), path + "/index.html"),
            )
            for fs_path, url_path in candidates:
                if os.path.isfile(fs_path):
                    self.path = url_path
                    break
            else:
                return self.not_found()
        elif os.path.isdir(local) and not os.path.isfile(os.path.join(local, "index.html")):
            return self.not_found()
        return super().send_head()

    def not_found(self):
        page = os.path.join(self.directory, "404.html")
        if not os.path.isfile(page):
            self.send_error(404)
            return None
        body = open(page, "rb").read()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        from io import BytesIO
        return BytesIO(body)

    def log_message(self, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3200
    directory = sys.argv[2] if len(sys.argv) > 2 else "out"
    handler = partial(Netlifyish, directory=os.path.abspath(directory))
    print("Serving %s on http://127.0.0.1:%d" % (os.path.abspath(directory), port))
    ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()


if __name__ == "__main__":
    main()
