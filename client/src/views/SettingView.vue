<template>
  <div class="personalInfo">
    <div class="container-fluid p-4 bg-primary text-white">
      <h1>Settings</h1>
    </div>
    <div class="card mx-auto m-4 w-50">
      <h5 class="card-header text-center p-2">Password Settings</h5>
      <div class="card-body">
        <div id="alert" v-if="alert">{{ alert }}</div>
        <form @submit.prevent="checkOldPassword">
          <label for="OriginPassword">
            <p>Origin Password</p>
            <input
              id="OriginPassword"
              v-model="password"
              placeholder="original password"
              class="mt-2"
            />
          </label>
        </form>
        <form @submit.prevent="checkAndResetPassword">
          <label for="password1">
            <p>Password</p>
            <input id="password1" v-model="password" placeholder="new password" class="mt-2" />
          </label>
          <br />
          <label for="password2">
            <p>Confirm new Password</p>
            <input
              id="password2"
              v-model="passwordVerify"
              placeholder="new password"
              class="mt-2"
            />
          </label>
          <br />
          <button type="submit" class="mx-auto m-3" v-on:click="updatePassword">
            Reset password
          </button>
        </form>
      </div>
    </div>

    <div class="card mx-auto m-4 w-50">
      <h5 class="card-header text-center p-3">User Name</h5>
      <div class="card-body">
        <div id="alert" v-if="alert">{{ alert }}</div>
        <form>
          <label for="userName">
            <p>New User name</p>
            <input id="userName" v-model="userName" placeholder="Your new user name" class="mt-2" />
          </label>
          <br />
          <button type="submit" class="mx-auto m-3" v-on:click="updateUserName">
            Reset User Name
          </button>
        </form>
      </div>
    </div>

    <div class="card mx-auto m-4 w-50">
      <h5 class="card-header text-center p-3">Contact</h5>
      <div class="card-body">
        <div id="alert" v-if="alert">{{ alert }}</div>
        <form>
          <label for="contact">
            <p>New Contact</p>
            <input
              id="contact"
              v-model="contact"
              placeholder="Your new contact Information"
              class="mt-2"
            />
          </label>
          <br />
          <button type="submit" class="mx-auto m-3" v-on:click="updateContact">
            Reset contact
          </button>
        </form>
      </div>
    </div>
    <div class="card mx-auto m-4 w-50">
      <h5 class="card-header text-center p-3">Bio</h5>
      <div class="card-body">
        <div id="alert" v-if="alert">{{ alert }}</div>
        <form>
          <label for="Bio">
            <p>New Bio</p>
            <input id="Bio" v-model="Bio" placeholder="Show Yourself more!" class="mt-2" />
          </label>
          <br />
          <button type="submit" class="mx-auto m-3" v-on:click="updateBio">Update Bio</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios').default;

const SETTING_PASSWORD_URL = 'http://localhost:4000/setting/password';
const SETTING_NAME_URL = 'http://localhost:4000/setting/name';
const SETTING_CONTACT_URL = 'http://localhost:4000/setting/contact';
const SETTING_BIO_URL = 'http://localhost:4000/setting/bio';
// Initialize Userfront
// Userfront.init("demo1234");

export default {
  data() {
    return {
      originPassword: null,
      password: null,
      userName: '',
      Bio: '',
      contact: '',
      passwordVerify: '',
      alert: '',
    };
  },

  computed: {
    userId() {
      return Number(this.$store.getters.getUserId);
    },
  },

  methods: {
    checkAndResetPassword() {
      this.alert = '';
      // Verify that the passwords match

      if (this.password !== this.passwordVerify) {
        this.alert = 'Passwords must match';
        // return;
      }
      // Call Userfront.resetPassword()
      // Userfront.resetPassword({
      //   password: this.password,
      // }).catch((error) => {
      //   this.alert = error.message;
      // });
    },
    // checkOldPassword() {
    //   if (this.originPassword !== oldPassword) {
    //     this.alert = 'The Old Password is Incorrect!';
    //     // return;
    //   }
    // },

    updatePassword() {
      const keyword = this.password;
      const id = this.$store.getters.getUserId;
      axios.post(SETTING_PASSWORD_URL, { password: keyword, user_id: id });
      setTimeout(this.pageUpdate(), 250);
    },

    updateUserName() {
      const userNewName = this.userName;
      const id = this.$store.getters.getUserId;
      axios.post(SETTING_NAME_URL, { userName: userNewName, user_id: id });
      setTimeout(this.pageUpdate(), 250);
    },

    updateContact() {
      const contactInfo = this.contact;
      const id = this.$store.getters.getUserId;
      axios.post(SETTING_CONTACT_URL, { contact: contactInfo, user_id: id });
      setTimeout(this.pageUpdate(), 250);
    },

    updateBio() {
      const BioInfo = this.Bio;
      const id = this.$store.getters.getUserId;
      axios.post(SETTING_BIO_URL, { Bio: BioInfo, user_id: id });
      setTimeout(this.pageUpdate(), 250);
    },
  },
};
</script>

<style scoped>
input {
  display: block;
  margin-bottom: 10px;
  border:1px solid #ccc;
  padding:7px 0px;
  border-radius:7px;padding-left:5px;
  -webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
  box-shadow:inset 0 1px 1px rgba(0,0,0,.075);
  -webkit-transition:border-color ease-in-out .15s,
  -webkit-box-shadow ease-in-out .15s;
  -o-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s
  }
  input:focus{
  border-color:#66afe9;outline:0;
  -webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);
  box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)
}
#alert {
  color: red;
  margin-bottom: 10px;
}
button {
  background-color: #f66f6a;
  color: white;
  width: 175px;
  height: 50px;
  border: 0;
  font-size: 18px;
  box-sizing: content-box;
  border-radius: 30px;
}
button:hover {
  background-color: #f89998;
}
</style>
