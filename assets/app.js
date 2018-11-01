const http = axios.create({
	baseURL: 'index.cfm?endpoint=/',
	timeout: 1000,
	headers: {'apiKey': 'hawkfeedflaw'}
	});


new Vue({
	el: '#app',

	data () {
		return {
			router		: "welcome", // not a real router
			messages 		: [{"type" : "success", "content" : "<b>Success:</b> VueJS is running and is active"}],
			users 		: [],
			user 		: {},
			userModal		: {"title" : "Add User", "actionLabel" : "Add"},

			email 		: '',
			password 		: '',
			captcha_image 	: '',
			captcha_hash 	: '',
			captcha 		: '',

			login_token	: ''
		};
	},


	computed: {

		invalidEmail(){
			if (this.email.length == 0)			{ return 'Enter an email' 					}
			else if (this.email.length <= 4)		{ return 'This is too short to be a valid email'	}
			else if (!this.email.includes("@"))	{ return 'Email must include an @'				}
			else 							{ return '' 								}
			},

		stateEmail()	{ 
			if (this.email.length == 0) return "";
			return (this.email.includes("@") && this.email.length) > 4 ? "is-success" : "is-danger"
		},


		invalidPassword()	{
			if (this.password.length >= 4)		{ return '' 						}
			else if (this.password.length > 0)		{ return 'Enter at least 4 characters'	}
			else 							{ return '' 						}
		},

		statePassword()	{ return this.password.length >= 4 ? "is-success" : "is-danger" },


		invalidCaptcha()	{
			if (this.captcha.length > 4)			{ return '' 						}
			else if (this.captcha.length > 0)		{ return 'Enter at least 4 characters'	}
			else 							{ return 'Enter the characters/numbers displayed in the image above.' }
		},

		stateCaptcha()	{ 
			if (this.captcha.length == 0) return "";
			return this.captcha.length >= 4 ? "is-success" : "is-danger"
		}
	},

	mounted(){
		this.prelogin();
	},


	methods :	{

		clearMessages : function()	{
			this.messages = [];
		},


		prelogin : function() {
			http
				.get("login/captcha")
				.then(res => {this.captcha_image = res.data.captcha_image, this.captcha_hash = res.data.captcha_hash})
				.catch(function (error) { console.log(error); })
			;
		},

		logout : function()	{
			this.login_token = "";
			this.router = "welcome";
			this.messages = [{"type" : "warning", "content" : "<b>Warning:</b> You haved logged out."}]
		},

		login : function()	{
			console.log("Doing a login... with" + this.password);
			http
				.post("login", { email : this.email, password : this.password, captcha : this.captcha, captcha_hash : this.captcha_hash })
				.then(res => (
					this.messages = res.data.messages,
					res.data.loginToken !== "" ? this.login_token = "Bearer " + res.data.loginToken : ""
					)
				)
				.catch(function (error) { console.log(error.response); })
			;

			this.password = "";
		},

		// User series
		preAddUser : function() {
			this.user = {};
			this.router = 'usermodal';
		},

		addUser : function() {
			http
				.post("users", 
					{ data	: user },
					{ headers : {"authorization" : this.login_token }}
				)
				.then(res => (this.users = res.data.data))
				;
		},


		delUser : function (id) {
			http
				.delete("users/" + id, { headers : {"authorization" : this.login_token }})
				.then(res => (this.users = res.data.data))
				;
		},

		preEditUser : function (id)	{

			userModal	= {"title" : "Edit User", "actionLabel" : "Save"};

			http
				.get("users/" + id, { headers : {"authorization" : this.login_token }})
				.then(res => (this.user = res.data.data))
				;

			this.showUserModal = true;
		},

		editUser : function ()	{

		},

		listUser : function()	{
			this.router = 'users';
			console.log("Doing a get User");
			http
				.get("users", { headers : {"authorization" : this.login_token }})
				.then(res => (this.users = res.data.data ))
				.catch(function (error) { console.log(error.response); })
			;
		}

	} // end methods

});