<template>
  <div class="article-list">
    <van-pull-refresh
      v-model="isRefreshLoading"
      @refresh="onRefresh"
      :success-text="refreshSuccessText"
      :success-duration="1500"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        :error.sync="error"
        error-text="请求失败，点击重新加载"
        @load="onLoad"
      >
        <article-item
          v-for="(article, index) in list"
          :key="index"
          :article="article"
        ></article-item>
        <!-- <van-cell
          v-for="(article, index) in list"
          :key="index"
          :title="article.title"
        /> -->
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from "@/api/article";
import ArticleItem from "@/components/article-item";

export default {
  name: "ArticleList",
  components: {
    ArticleItem,
  },
  props: {
    channel: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      list: [], //存储列表数据的数组
      loading: false, //控制加载中loading状态
      finished: false, // 控制数据加载结束的状态
      timestamp: null, // 请求获取下一页数据的时间戳
      error: false, // 控制列表加载失败的提示状态
      isRefreshLoading: false, //控制下拉刷新的loading状态
      refreshSuccessText: "刷新成功", //下拉刷新成功提示文本
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 初始化或滚动到底部的时候会触发调用 onload
    async onLoad() {
      try {
        // 1.异步更新数据
        const { data } = await getArticles({
          channel_id: this.channel.id, //频道id
          // timestamp 简单理解就是请求数据的页码
          // 请求第一页数据，当前最新时间戳
          // 用于请求之后数据的时间戳会在当前请求结果中返回
          timestamp: this.timestamp || Date.now(),
          with_top: 1, // 是否包含置顶（进入页面第一次请求要包含置顶文章）
        });

        // 模拟随机失败的情况
        // if (Math.random() > 0.5) {
        //   JSON.parse("aaaaaaaaaaa");
        // }

        const { results } = data.data;
        // 2.把请求结果数据存储到list 数组中
        // 利用数组的展开运算符将数据一一添加到list中
        this.list.push(...results);
        // 3.加载状态结束
        this.loading = false;
        // 4.判断数据是否全部加载完成
        if (results.length) {
          // 更新获取下一页数据的时间戳
          this.timestamp = data.data.pre_timestamp;
        } else {
          // 没有数据了，将finished设置为true，不再load 加载更多的数据
          this.finished = true;
        }
      } catch (err) {
        //展示错误提示状态
        this.error = true;
        // 请求失败了loading也需要关闭
        this.loading = false;
      }
    },
    // 下拉刷新的时候会触发该函数
    async onRefresh() {
      try {
        // 1.请求获取数据
        const { data } = await getArticles({
          channel_id: this.channel.id, //频道id
          timestamp: Date.now(), // 下拉刷新，每次请求获取最新数据
          with_top: 1, // 是否包含置顶（进入页面第一次请求要包含置顶文章）
        });

        // 模拟随机失败的情况
        // if (Math.random() > 0.2) {
        //   JSON.parse("aaaaaaaaaaa");
        // }

        // 2.将数据追加到列表的顶部
        const { results } = data.data;
        this.list.unshift(...results);
        // 3.关闭下拉刷新的loading状态
        this.isRefreshLoading = false;
        // 更新下拉刷新成功提示的文本
        this.refreshSuccessText = `刷新成功，更新了${results.length}条数据`;
      } catch (err) {
        this.refreshSuccessText = "刷新失败";
        this.isRefreshLoading = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.article-list {
  // 百分比单位是相对父元素的
  // height:100%;
  height: 79vh;
  overflow-y: auto;
}
</style>