What is WebEL
=============
WebEL is supposed to become a full web-based client for the Eternal Lands
MMORPG (http://eternal-lands.com/), using WebGL to draw the graphics. Right
now though, it is still heavily in development, and is not much more than a
rather clunky viewer for the amazing maps in the game. So please note:

WebEL is far from finished, and currently my time for developing it further is
limited. It may or may not work on your system. In fact, I expect it probably
won't. On the off chance that it does something after all, it may kill your cat.
Or cause global warming. World-wide diseases. It may have you abducted by
space aliens with slimy tentacles instead of arms.

All right, so it probabably won't do all of that. But I'm not giving any
guarantees, and if you install this software, you are pretty much on your own.


How to install WebEL on your web server
=======================================
Make sure you have a web server available which can serve PHP (any version >= 5
is probably okay). In development, Apache 2.4 was used, and the .htaccess file
in the source code is for Apache. You may have luck with other web servers, but
I have not tried any. URL rewriting should be enabled, since the names of the
data files in the Eternal Lands client data are sent verbatim to the web server,
and requests for said file need to be redirected to the appropriate PHP script
or 

The WebEL code is not more than a collection of javascript and PHP files, and
can simply be copied into the site's root directory. Furthermore, WebEL uses a
few external javascript files, which are not included in the source tree. These
should be installed into the "js/extern" directory, and are:

gl-matrix.js: Install from https://github.com/toji/gl-matrix.git. Version 2.2.2
is used in development. Be careful with which version you download, the API for
gl-matrix seems to change rather a lot.

webgl-utils.js: download from
https://webglsamples.googlecode.com/hg-history/41401f8a69b1f8d32c6863ac8c1953c8e1e8eba0/book/webgl-utils.js
Contains various utilities for setting up a WebGL canvas and the rendering loop.

jquery-2.1.3.js: download from https://jquery.com/. Version 2.1.3 is used in
development. Used for making AJAX calls. The dependence on JQuery may disappear
in the future. Installing and serving a full version of JQuery just for making
AJAX calls is a bit overkill.


Finally, you will need to install the Eternal Lands client data. Download these
from http://www.eternal-lands.com/page/download.php, and unpack the contents of
the package in a directory named "elc" on the web site. (it should not matter
if you use the Windows, Mac or Linux package, the executables in them are not
used; the data files in all versions should be the same.


Communication with the game server
==================================
Since Eternal Lands is an online role-playing game, WebEL needs to communicate
with the game server somehow. Unfortunately (or fortunately from a security
point of view), Javascript does not allow raw sockets to be created. The
alternative currently used in WebEL is to use Web sockets in Javascript, and to
set up a proxy service that forwards all commucations over this Web socket to
the game server.

A script to start such a proxy server (startproxy.sh) using websockify
(https://github.com/kanaka/websockify or your system's package system) is
included in the source code.  You will have to change the URL in this script
to that of the site where you installed WebEL.


Using WebEL in a browser
========================
As with any web software, simply direct your browser to the URL where you
installed WebEL. You will need a WebGL-capable browser, preferably using some
form of hardware acceleration (unless you want to count your frame rate manually,
that is), and a graphics card that is capable of handling S3TC compressed
textures.

As said, the code doesn't do much yet. You can rotate the camera using the
arrow keys, and step back and forward using the Insert and Delete keys. Zoom
in and out using PageUp/Down. That's it. 

The code will try to set up a connection to the game server, but currently only
a PING request is acknowledged, and the welcome message from the game server is
drawn on the screen.
