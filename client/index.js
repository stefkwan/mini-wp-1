Vue.config.devtools = true

let baseUrl = "http://localhost:3000/api"

var app = new Vue({
  el: '#app',
  data: {
    isLoggedin: false,
    loginArea: true,
    registerArea: true,
    postArea: false,
    sidebarArea: true,
    errorMessage: "",
    successMessage: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    articles: [],
    newTitle: "",
    newContent: "",
    search: "",
    editArticleArea: false,
    currentArticle: {}
  },
  components: {
    'editor': Editor // <- Important to load wysiwyg api tiny.mce
  },
  created(){
      axios({
        method: "GET",
        url: baseUrl+"/articles"
      })
      .then(({data}) => {

        data.sort( function(a,b){
          return new Date(b.created_at) - new Date(a.created_at)
        })

        this.articles = data;
      })
      .catch(err => {
        console.log("created error:",err)
      })
  },
  computed: {
    filteredArticles(){
      let filtered = [];

      this.articles.forEach(article => {
        let strArticle = article.title;
        if (strArticle.includes(this.search)) {
          filtered.push(article)
        }
      })
      return filtered
    }
  },
  methods: {
    toggleLoginArea(){
      if (this.loginArea){
        this.loginArea = false;
      } else {
        this.loginArea = true;
      }
    },
    loginUser(){
      axios({
        method: "POST",
        url: baseUrl+"/users/login",
        data: {
          email: this.userEmail,
          password: this.userPassword
        }
      })
      .then(({data}) => {

      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
    registerUser(){
      axios({
        method: "POST",
        url: baseUrl+"/users/register",
        data: {
          name: this.userName,
          email: this.userEmail,
          password: this.userPassword
        }
      })
      .then(({data}) => {
        this.clearError()
        this.registerArea = false
        this.showMsg("Successfully registered", this.userEmail)
      })
      .catch(err => {
        console.log("created error at register:")
        console.log(err)
        this.showError(JSON.stringify(err))
      })

    },
    showError(err){
      this.errorMessage = err
    },
    clearError(){
      this.errorMessage = ""
    },
    showMsg(msg){
      this.successMessage = msg
    },
    clearMsg(){
      this.successMessage = ""
    },
    logoutUser(){

    },
    toggleRegister(){
      if (this.registerArea){
        this.registerArea = false;
      } else {
        this.registerArea = true;
      }
    },
    toggleSidebar(){
      if (this.sidebarArea){
        this.sidebarArea = false;
      } else {
        this.sidebarArea = true;
      }
    },
    togglePost(){
      if(this.postArea) {
        this.postArea = false
      } else {
        this.postArea = true
      }
    },
    readArticle(articleId){
      axios({
        method: "GET",
        url: `${baseUrl}/articles/read/0/${articleId}`
      })
      .then(({data}) => {
        console.log("read an article,",data)

        let [api_key, readStr] = data

        VoiceRSS.speech({
            key: api_key,
            src: readStr,
            hl: 'en-us',
            r: 0, 
            c: 'mp3',
            f: '44khz_16bit_stereo',
            ssml: false
        });

      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
    updateArticle(){
      let currentArticle = this.currentArticle
      let newInput = {
        title: this.newTitle,
        content: this.newContent,
        created_at: (new Date()).toDateString()
      }

      axios({
        method: "PATCH",
        url: `${baseUrl}/articles/0/${currentArticle._id}`,
        data: newInput
      })
      .then(({data}) => {
        console.log("updated an article")
        this.cancelEdit()

        let updatedList = []
        this.articles.forEach(article => {
          if (article._id === data._id){
            article = data;
          }
          updatedList.push(article)
        })

        updatedList.sort(function(a,b){
          return new Date(b.created_at) - new Date(a.created_at)
        })

        this.articles = updatedList
      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
    editArticle(articleId){
      this.editArticleArea = true;

      axios({
        method: "GET",
        url: baseUrl+"/articles/"+articleId
      })
      .then(({data}) => {
        console.log("get one article,",data)
        console.log("selected an article")
        this.currentArticle = data
        this.newTitle = data.title
        this.newContent = data.content
      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
    cancelEdit(){
      this.currentArticle = {}
      this.editArticleArea = false;
      this.newTitle = "";
      this.newContent = "";
    },
    delArticle(articleId){
      axios({
        method: "DELETE",
        url: baseUrl+"/articles/0/"+articleId
      })
      .then(({data}) => {
        console.log("deleted an article")
        this.articles = this.articles.filter(article => article._id !== articleId)
      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
    addArticle(){
      this.togglePost()
      let newArticle = {title:this.newTitle, content:this.newContent, created_at: (new Date()).toDateString()}
      
      axios({
        method: "POST",
        url: baseUrl+"/articles",
        data: newArticle
      })
      .then(({data}) => {
        console.log("created an artcle")
        this.articles.push(data)
        this.newTitle = "";
        this.newContent = "";
      })
      .catch(err => {
        console.log("created error:",err)
        this.showError(err)
      })
    },
  }
})
