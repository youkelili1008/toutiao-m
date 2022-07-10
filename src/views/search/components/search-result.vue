<template>
  <div class="search-result">
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      :error.sync="error"
      error-text="加载失败，请点击重试"
      @load="onLoad"
    >
      <van-cell
        v-for="(article, index) in list"
        :key="index"
        :title="article.title"
      />
    </van-list>
  </div>
</template>

<script>
import { getSearchResult } from "@/api/search";

export default {
  name: "SearchResult",
  components: {},
  props: {
    searchText: {
      type: String,
      required: "true",
    },
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1,
      per_page: 15,
      error: false,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    async onLoad() {
      try {
        // 1.异步请求获取数据
        const { data } = await getSearchResult({
          page: this.page, //页码
          per_page: this.per_page, // 每页大小
          q: this.searchText, // 查询关键词
        });
        // console.log(data);

        // 模拟随机失败的情况
        // if (Math.random() > 0.5) {
        //   JSON.parse("aaaaaaaaaaa");
        // }

        // 2.将数据添加到数组列表中
        const { results } = data.data;
        this.list.push(...results);

        // 3.加载状态结束，关闭loading
        this.loading = false;

        // 4.判断数据是否全部加载完成
        if (results.length) {
          //      如果有， 则更新获取下一页数据的页码
          this.page++;
        } else {
          //      如果没有，则将加载状态finished设置为结束
          this.finished = true;
        }
      } catch (err) {
        // 展示加载失败的提示状态
        this.error = true;
        // 加载失败，loading也随之关闭
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
</style>