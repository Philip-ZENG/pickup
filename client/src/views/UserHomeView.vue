<template>
  <div class="home">
    <table class="table-borderless" cellspacing="0" cellpadding="0" align="center">
      <tr height="100px">
        <!--first row-->
        <td id="welcome" align="center" colspan="2" border="1px">
          <div>
            Welcome to PickUp, hope you can find friends here.
          </div>
          <div>Now is: {{ nowDate }}</div>
        </td>
        <td id="create" align="center">
          <button id = "createNew" @click="tryPost">
          + Post a new event</button>
        </td>
      </tr>
      <tr height="50px">
        <!--second row-->
        <td align="center" width="33%" class="p-3">
          <!--search bar-->
          <div class="rightSep">
            <select v-model="searchType" style="height: 30px; margin-right:5px">
              <option value="type">type</option>
              <option value="title">title</option>
            </select>
            <input v-model="userInput" style="height: 30px; margin-right:5px">
            <button id="search1" @click="searchActivity" class="tSearch">search</button>
          </div>
        </td>
        <td align="center" width="33%" class="p-3">
          <!--order bar-->
          <div class="rightSep" id="order-select">
            <select v-model="searchOrder" style="height: 30px; margin-right:5px">
              <option disabled value="">Please select one</option>
              <option value="MostRecent">Most Recent</option>
            </select>
            <button id="sort" @click="sortActivity" class="tSearch">Sort</button>
          </div>
        </td>
        <td align="center" width="33%" class="p-3">
          <!--date bar-->
          <div>
            <datepicker
              v-model="dateinput"
              :disabled-dates="{ to: new Date() }"
              iconColor="green">
              <template v-slot:belowDate>
                <div style="height:0px"></div>
              </template>
            </datepicker>
            <button id="search2" @click="searchByDate" class="tSearch">search</button>
          </div>
        </td>
      </tr>
    </table>

    <div class="actSquare">
      <!-- activity square-->
      <span v-show="shownActivity.length === 0"> no activity available</span>
      <dl>
        <dt v-for="(act, index) in shownActivity" :key="index">
          <activity-card :title="act.title"
            :type="act.type"
            :location="act.location"
            :time="dateToString(new Date(act.time))"
            @click="showDetail(index)">
          </activity-card>
        </dt>
      </dl>
      <div class="pageList">
        <!-- page -->
        <button @click="page -= 1" :disabled="page == 1">previous</button>
        <span style="margin-left: 10px; margin-right: 10px"> {{ page }} </span>
        <button @click="page += 1" :disabled="page == numOfPages">next</button>
        <span> go to: </span>
        <select v-model="userPage">
          <option v-for="p in numOfPages" :key="p" :disabled="p == page">{{ p }}</option>
        </select>
      </div>
    </div>
    <!-- detail card-->
    <!--eslint-disable-next-line -->
    <div class="cardOut" v-show="cardSelected" @click="cardSelected = false"></div>
      <div class="detailCard" v-show="cardSelected">
        <table width="90%" height="90%" margin="5%" cellspacing="0" cellpadding="0" align="center">
          <tr width="100%" height="50px"> <!-- first row-->
            <td width="25%">organizer: {{managerName}}</td>
            <td width="30%">type: {{Object(shownActivity[chosenIndex]).type}}</td>
            <td width="45%">title: {{Object(shownActivity[chosenIndex]).title}}</td>
          </tr>
           <tr width="100%" height="50px"> <!-- second row-->
            <!--eslint-disable-next-line -->
            <td>member:{{Object(shownActivity[chosenIndex]).max_capacity - Object(shownActivity[chosenIndex]).quota_left}} /
              {{Object(shownActivity[chosenIndex]).max_capacity}}</td>
            <td>Loc: {{Object(shownActivity[chosenIndex]).location}}</td>
            <td>Time: {{new Date(Object(shownActivity[chosenIndex]).time)}}</td>
          </tr>
          <tr width="100%" height="50px"> <!-- second row-->
            <td colspan="3" align="center">
              <!--eslint-disable-next-line -->
              <button
                class="join"
                @click="tryJoin"
                v-show="!(Object(shownActivity[chosenIndex]).quota_left === 0)">+
              </button>
              <span v-show="(Object(shownActivity[chosenIndex]).quota_left === 0)">
                This activity is full!!! Look for other activities.
              </span>
            </td>
          </tr>
          <tr>
            <td colspan="3">{{Object(shownActivity[chosenIndex]).description}}</td>
          </tr>
        </table>
      </div>
  </div>
</template>

<script>
/* eslint-disable */
import Datepicker from 'vuejs3-datepicker';
import ActivityCard from '../components/Home/ActivityCard.vue';

const axios = require('axios').default;

export default {
  components: {
    Datepicker,
    'activity-card': ActivityCard,
  },

  data() {
    return {
      searchOrder: '',
      searchType: 'type',
      actInformation: [], // store the activity information
      page: 1, // store the page number
      userInput: '', // store the user's input for searching
      userPage: null, // the page number user want to view
      dateinput: new Date(),
      minNum: null,
      maxNum: null,
      cardSelected: false,
      chosenIndex: 0,
      memberIdList: null,
      managerName: null,
      nowDate: "", // 当前日期
    };
  },

  computed: {
    userId() {
      return Number(this.$store.getters.getUserId);
    },
    //calculate the total number of pages
    totalActivityNum() {
      return this.actInformation.length;
    },
    //calculate the current page number
    numOfPages() {
      const temp = Math.floor(this.totalActivityNum / 12);
      const res = this.totalActivityNum % 12;
      if (res === 0) {
        return temp;
      }
      return temp + 1;
    },
    //return the activity on a certain page
    shownActivity() {
      const res = [];
      if (this.page * 12 > this.actInformation.length) {
        for (let i = (this.page - 1) * 12; i < this.actInformation.length; i += 1) {
          res.push(this.actInformation[i]);
        }
      } else {
        for (let i = 0; i < 12; i += 1) {
          res.push(this.actInformation[(this.page - 1) * 12 + i]);
        }
      }
      return res;
    },

    shownMemberList() {
      if (this.memberIdList === null) return [[0],[0]];
      return this.memberIdList;
    },
  },

  watch: {
    //the page number changes when user change the page number by clicking the page change button
    userPage() {
      this.page = Number(this.userPage);
    },
  },

  methods: {
    switchTo(path) {
      this.$router.push(path);
    },

    tryPost() {
      if (this.userId === null || this.userId === 0) {
        alert('please first log in');
        this.switchTo('/login')
      }
      else this.switchTo('/activityCreation');
    },

    //search for activity given certain type or title
    searchActivity() {
      axios
        .post('http://localhost:4001/searchActivity', {
          searchType: this.searchType,
          userInput: this.userInput,
        })
        .then((response) => {
          this.actInformation = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    //get activity infromation from database
    askInfo() {
      axios
        .post(
          'http://localhost:4001/getActivityInfo', 
          { today: this.dateToString(new Date())})
        .then((response) => {
          this.actInformation = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    //search for the activity on a certain day
    searchByDate() {
      axios
        .post('http://localhost:4001/searchByDate', {
          dateinput: this.dateToString(this.dateinput),
        })
        .then((response) => {
          this.actInformation = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    //change the Date() form variable to string form
    dateToString(date) {
      const year = date.getFullYear();
      let month = (date.getMonth() + 1).toString();
      let day = date.getDate().toString();
      let dateTime = '';
      if (month.length === 1) {
        month = '0' + month;
      }
      if (day.length === 1) {
        day = '0' + day;
      }
      dateTime = year + '-' + month + '-' + day;
      return dateTime;
    },

    //show detail information about the card the user are interested in
    showDetail(index) {
      this.chosenIndex = index;
      const act = Object(this.shownActivity[this.chosenIndex]);

      axios.post(
        'http://localhost:4001/activityMember',
        { activity_id: act.activity_id}
      ).then((response) => {
        this.memberIdList = response.data.idList;
        this.managerName = response.data.name;
      }).catch((error) => {
        console.log(err);
      });
      this.cardSelected = true;
    },
    //sort the activity
    sortActivity() {
      axios
        .post('http://localhost:4001/MostRecent')
        .then((response) => {
          this.actInformation = response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    //for user to join a certain activity he/her is interested in
    tryJoin() {
      if (this.userId === null || this.userId === 0) {
        alert('Please first login!');
        this.switchTo('/login');
      }else{
        if (this.memberIdCheck()){
          alert('You have already participated in the activity!');
          this.cardSelected = false;
          return;
        }
        else{
          axios.post(
            'http://localhost:4001/joinActivity',
            { activity_id:this.shownActivity[this.chosenIndex].activity_id, user_id: this.userId}
          );
          alert('You successfully join the activity!');
          this.cardSelected = false;
        }
      }
    },

    memberIdCheck() {
      if (this.memberIdList[0][0] === this.userId) return true;
      for (var i = 0; i < this.memberIdList[1].length; i++) {
        if(this.memberIdList[1][i] === this.userId) return true;
      }
      return false;
    },

    currentTime() {
      setInterval(this.formatDate, 500);
    },

    formatDate() {
      let date = new Date();
      let year = date.getFullYear(); // Year
      let month = date.getMonth() + 1; // Month
      let day = date.getDate(); // Day
      let week = date.getDay(); // Week
      let weekArr = [ "Sunday", "Monday", "Tuesday", "Wedesday", "Thursday", "Friday", "Saturday" ];
      let hour = date.getHours(); // hour
      hour = hour < 10 ? "0" + hour : hour;
      let minute = date.getMinutes(); // min
      minute = minute < 10 ? "0" + minute : minute;
      let second = date.getSeconds(); // sec
      second = second < 10 ? "0" + second : second; 
      this.nowDate = `${year}/${month}/${day} ${hour}:${minute}:${second} ${weekArr[week]}`;
    }
  },

  mounted() {
    this.askInfo();
    this.currentTime();
  },

  beforeDestroy() {
    if (this.formatDate) {
      clearInterval(this.formatDate); 
    }
  }
};
</script>

<style scoped>
table {
  border:none;
}
#createNew {
  height: 40px;
  width: 150px;
  background-color:rgb(149, 193, 247);
  color:black;
  border:0;
  font-size: 15px;
  box-sizing: content-box;
  border-radius: 15px;

  }
#createNew:hover{
    background-color: rgb(149, 193, 247);
}
#search1 {
  border-radius: 5px;
  background-color:rgb(149, 193, 247);
  color:black;
  border:0;
  font-size: 15px;
  box-sizing: content-box;
  margin-left: 1%;
  }
#search1:hover{
    background-color: rgb(149, 193, 247);
}

#search2 {
  border-radius: 5px;
  background-color:rgb(149, 193, 247);
  color:black;
  border:0;
  font-size: 15px;
  box-sizing: content-box;
  margin-left: 3%;
  }
#search2:hover{
    background-color: rgb(149, 193, 247);
}

#sort {
  border-radius: 5px;
  background-color:rgb(149, 193, 247);
  color:black;
  border:0;
  font-size: 15px;
  box-sizing: content-box;
  margin-left: 1%;
  }
#sort:hover{
    background-color: rgb(149, 193, 247);
}

input {
  /* display: block; */
  margin-bottom: 10px;
  border:1px solid #ccc;
  padding:7px 0px;
  border-radius:7px;
  padding-left:5px;
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

#welcome {
  border-style: solid;
  border-width: 0px 1px 1px 0px;
}

#create {
  border-style: solid;
  border-width: 0px 0px 1px 0px;
}

.rightSep {
  width: 350px;
  margin: 5px;
  border-style: solid;
  border-width: 0px 1px 0px 0px;
}

.showTable {
  width: 100%;
  border-style: solid;
  border-width: 0px 0px 0px 0px;
  border-color: black;
}

.actSquare {
  padding-left: 6%;
  padding-right: 6%;
  padding-top: 1%;
}

.pageList {
  position: fixed;
  bottom: 0%;
  width: 100%;
  height: 5%;
  background-color: white;
}

.cardOut {
  position: fixed;
  bottom: 0%;
  top: 0%;
  left: 0%;
  right: 0%;
  height: 100%;
  width: 100;
  background: rgba(0, 0, 0, 0.2);
}

.detailCard {
  position: fixed;
  top: 25%;
  bottom: 25%;
  left: 25%;
  right: 25%;
  width: 50%;
  height: 50%;
  background-color: whitesmoke;
  border: solid;
  border-radius: 10px;
}

.tSearch {
  border-radius: 5px;
  background-color: white;
}

.join {
 border:solid;
 border-radius:50%;
 height:30px;
 width:30px;
}
</style>

