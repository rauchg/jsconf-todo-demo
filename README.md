JSConf.eu Socket.IO+Nodestream TODO Application Demo
====================================================

## Introduction

This application was written for my JSConf.eu 2010 presentation. 

Up until [6da2576](https://github.com/guille/jsconf-todo-demo/tree/6da25769f2fcb4d5c0d88d5f558b6dc998a2cecc) it's a simple application powered by:

- [Express](http://github.com/visionmedia/express) (web framework)

- [Mongoose](http://github.com/learnboost/mongoose) (MongoDB ODM)

- [Jade](http://github.com/visionmedia/jade) (template language)

In that state, it doesn't do any dynamic AJAX replacements or additions and is a simple Web 1.0 application. The only time when AJAX is used is to present the user with an edit overlay, by fetching the edit form from the server. However, that form is submitted normally. When the user adds edits or deletes normal redirections are used.

## Going realtime

The purpose of the project is to show the power of nodestream. Nodestream is a simple Socket.IO server-side API and jQuery client-side API that allows you to make realtime web applications with little coding. Most of the logic of the realtime actions is encapsulated in the Jade template language.

Making the application realtime results in:

- All the tabs opened with the TODO list by an user showing the same content (single-user effect)

- All users seeing the exact same content (multi-user effect)

Two areas are made realtime (a counter of active users and the todo list itself). In order to do so, only 3 steps are required:

- Emit events when the data is modified, appended or edited (from the ODM) or when a user connects

- Indicate what pieces of content are realtime in the template language and to what events they're bound.

## How to run

1. Install MongoDB 
2. Clone the repository (recursively!)

	git clone git://github.com/guille/jsconf-todo-demo.git --recursive todo

3. Run it

	cd todo
	sudo node server.js

And point your browser to `http://localhost`

## Credits

Guillermo Rauch &lt;guillermo@learnboost.com&gt; ([guille](http://github.com/guille))