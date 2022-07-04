<template>
  <div class="login-container">
    <!-- 导航栏 -->
    <van-nav-bar class="page-nav-bar" title="登录">
      <van-icon slot="left" name="cross" @click="$router.back()"></van-icon>
    </van-nav-bar>

    <!-- 登录表单 -->
    <!-- 1.给van-field组件配置rules验证规则 2.当表单提交的时候，会自动触发表单验证；如果验证通过则触发submit事件，失败则不会触发 -->
    <van-form ref="loginFormRef" @submit="onSubmit">
      <van-field
        v-model="user.mobile"
        name="mobile"
        type="number"
        maxlength="11"
        placeholder="请输入手机号"
        :rules="userFormRules.mobile"
      >
        <i slot="left-icon" class="toutiao toutiao-shouji"></i>
      </van-field>
      <van-field
        v-model="user.code"
        name="code"
        type="number"
        maxlength="6"
        placeholder="请输入验证码"
        :rules="userFormRules.code"
      >
        <i slot="left-icon" class="toutiao toutiao-yanzhengma"></i>
        <template #button>
          <!-- time:倒计时时间 -->
          <van-count-down
            v-if="isCountDownShow"
            :time="1000 * 10"
            format="ss s"
            @finish="isCountDownShow = false"
          />
          <van-button
            v-else
            class="send-sms-btn"
            native-type="button"
            round
            size="small"
            type="default"
            @click="onSendSms"
            >发送验证码</van-button
          >
        </template>
      </van-field>
      <div class="login-btn-wrap">
        <van-button class="login-btn" block type="info" native-type="submit"
          >登录</van-button
        >
      </div>
    </van-form>
  </div>
</template>

<script>
import { login, sendSms } from "@/api/user";

export default {
  name: "LoginIndex",
  components: {},
  props: {},
  data() {
    return {
      user: {
        mobile: "", // 手机号
        code: "", // 验证码
      },
      // 表单的验证规则对象
      userFormRules: {
        mobile: [
          { required: true, message: "手机号不能为空" },
          { pattern: /^1[3/5/7/8]\d{9}$/, message: "手机号格式错误" },
        ],
        code: [
          { required: true, message: "验证码不能为空" },
          {
            pattern: /^\d{6}$/,
            message: "验证码格式错误",
          },
        ],
      },
      // 控制倒计时的显示与隐藏
      isCountDownShow: false,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    async onSubmit() {
      // 1.获取表单数据
      const user = this.user;
      // 2.表单验证

      // 在组件中必须通过this.$toast来调用Toast组件
      this.$toast.loading({
        message: "登录中...",
        forbidClick: true, // 禁用背景点击
        duration: 0, // 持续时间，默认2000， 0表示持续展示不关闭
      });

      // 3.提交表单请求登录
      try {
        const { data } = await login(user);
        this.$store.commit("setUser", data.data);
        this.$toast.success("登录成功");

        // 登录成功， 跳转会原来页面(back方式不严谨)
        this.$router.back();
      } catch (err) {
        if (err.response.status === 400) {
          this.$toast.fail("手机号或验证码错误");
        } else {
          this.$toast.fail("登录失败,请稍后重试");
        }
      }
      // 4.根据请求响应结果处理后续操作
    },
    async onSendSms() {
      // 1.校验手机号
      try {
        await this.$refs.loginFormRef.validate("mobile");
      } catch (err) {
        return console.log("验证失败", err);
      }
      // 2.验证通过，显示倒计时
      this.isCountDownShow = true;
      // 3.请求发送验证码
      try {
        await sendSms(this.user.mobile);
        this.$toast("发送成功");
      } catch (err) {
        // 发送失败，关闭倒计时
        this.isCountDownShow = false;
        if (err.response.status === 429) {
          this.$toast("请求过于频繁，请稍后重试");
        } else {
          this.$toast("发送失败, 请稍后重试");
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.login-container {
  .toutiao {
    font-size: 37px;
  }

  .send-sms-btn {
    background-color: #ededed;
    width: 162px;
    height: 46px;
    line-height: 46px;
    font-size: 22px;
    color: #666;
  }

  .login-btn-wrap {
    padding: 53px 33px;
    .login-btn {
      background-color: #6db4fb;
      border: none;
    }
  }
}
</style>

