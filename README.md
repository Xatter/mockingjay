Description
-----------
This is a very simple web server and chat page. There is only one room, no logins, everyone can see what everyone else says.
This is intended for internal teams to deploy to the LAN when you can't use normal chat services like IRC or Hipchat because of security policies or whatever.

I built this as a place for teams of programmers, dev ops, testers, etc to be able to more effectively communicate with one another without paying per user or having to use someone else's servers.
As such this chat system has a few interesting features to that end:

Features
========
* Code formatting and syntax highlighting
* Simple image sharing by dragging and dropping an image anywhere on the window
* Simple file sharing of any file, any size, any type by dragging and dropping
*  Typically log files are too large, or sending binaries to testers is difficult as they get filtered by enterprise mail filters

Incomplete list of Missing features:
------------------------------------
* Currently it keeps no logs
* Stores no user preferences (except username)
* No rooms
* No private messages
* ~~No cat pictures (this is priority one to be fixed)~~
* No SECURITY or any kind, in fact this is laughably hackable. *You should not deploy this to the public internet!*

Installation
============

For a completely local installation on linux:

Mostly stolen from here http://forcecarrier.wordpress.com/2013/07/26/installing-pip-virutalenv-in-sudo-free-way/

Install setuptools first into user local

    $ wget https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py
    $ python ez_setup.py –user

Then Pip:

	$ curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
	$ python get-pip.py –user

Then Virtualenv:

	$ pip install –user virtualenv	

Add `~/.local/bin` to your `$PATH` variable

Then activate the virtualenv and install the requirements:

    $ virtualenv venv
    $ source venv/bin/activate (on windows it's > venv\Scripts\activate.bat)
    $ pip install -r requirements.txt

Then run and connect:

	$ python app.py

Point your browser to http://localhost:9000/
