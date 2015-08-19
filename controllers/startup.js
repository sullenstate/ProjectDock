var startupController = {
	index: function(req, res) {
		res.render('index');
	},
	login: function(req, res) {
		res.render('login');
	},
	app: function(req, res) {
		// console.log(req.user)
		res.render('projectdock', {user: req.user});
	},
	signup: function(req, res) {
		res.render('signup');
	},
	text: function(req, res) {
		console.log(req.body);
		res.send(200);
	}
};

module.exports = startupController;