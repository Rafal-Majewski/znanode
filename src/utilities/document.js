module.exports={
	styles: /*css*/`
		* {
			box-sizing: border-box;
		}
	`,
	node=()=>(html({
		title: "Znanode",
		meta: {
			charset: "utf-8",
			description: "Znanode test",
			author: "Rafał Majewski"
		},
		children: [
			div({hook: "welcome", children: ["welcome to znamznam"]}),
			text({hook: "test", style: "color: red;", content: "please click the button"}),
			Button({children: ["click me"], onClick: function(){
				this.parent.hooks.test.content="the button has been clicked!";
			}}),
		],
	})),
};