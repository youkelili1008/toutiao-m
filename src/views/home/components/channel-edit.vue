<template>
  <div class="channel-edit">
    <!-- 我的频道 -->
    <van-cell :border="false">
      <div slot="title" class="title-text">我的频道</div>
      <van-button
        class="edit-btn"
        type="danger"
        plain
        round
        size="mini"
        @click="isEdit = !isEdit"
        >{{ isEdit ? "完成" : "编辑" }}</van-button
      >
    </van-cell>
    <van-grid class="my-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in myChannels"
        :key="index"
        @click="onMyChannelClick(channel, index)"
      >
        <van-icon
          v-show="isEdit && !fixedChannels.includes(channel.id)"
          slot="icon"
          name="clear"
        ></van-icon>
        <span class="text" slot="text" :class="{ active: index === active }">{{
          channel.name
        }}</span>
      </van-grid-item>
    </van-grid>

    <!-- 频道推荐 -->
    <van-cell :border="false">
      <div slot="title" class="title-text">频道推荐</div>
    </van-cell>
    <van-grid class="recommend-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in recommendChannels"
        :key="index"
        :text="channel.name"
        icon="plus"
        @click="onAddChannel(channel)"
      />
    </van-grid>
  </div>
</template>

<script>
import {
  getAllChannels,
  addUserChannels,
  deleteUserChannels,
} from "@/api/channel";
import { mapState } from "vuex";
import { setItem } from "@/utils/storage";

export default {
  name: "ChannelEdit",
  components: {},
  props: {
    myChannels: {
      type: Array,
      required: true,
    },
    active: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      // 所有频道
      allChannels: [],
      isEdit: false, // 控制编辑状态的显示
      fixedChannels: [0], // 固定频道，不允许删除
    };
  },
  computed: {
    ...mapState(["user"]),
    // 推荐频道
    // 第一种方法：filter筛选数组
    recommendChannels() {
      return this.allChannels.filter((channel) => {
        return !this.myChannels.find(
          (mychannel) => mychannel.id === channel.id
        );
      });
    },
    // 第二种方法：
    // recommendChannels() {
    //   const channels = [];
    //   this.allChannels.forEach((channel) => {
    //     // find方法遍历数组，找出满足条件的元素项
    //     const ret = this.myChannels.find((mychannel) => {
    //       return mychannel.id === channel.id;
    //     });
    //     // 如果我的频道中不包含该项，就push到channels中
    //     if (!ret) {
    //       channels.push(channel);
    //     }
    //   });
    //   // 把计算结果返回
    //   return channels;
    // },
  },
  watch: {},
  created() {
    this.loadAllChannels();
  },
  mounted() {},
  methods: {
    async loadAllChannels() {
      try {
        const { data } = await getAllChannels();
        this.allChannels = data.data.channels;
        // console.log(data);
      } catch (err) {
        this.$toast("数据获取失败", err);
      }
    },
    // 添加频道至我的频道中
    async onAddChannel(channel) {
      // 数据持久化处理
      try {
        this.myChannels.push(channel);
        if (this.user) {
          // 已登录，把数据请求接口放到线上
          await addUserChannels({
            id: channel.id, //频道id
            seq: this.myChannels.length, //序号
          });
        } else {
          // 未登录，把数据存储到本地
          setItem("TOUTIAO_CHANNELS", this.myChannels);
        }
      } catch (err) {
        this.$toast("保存失败, 请稍后重试");
      }
    },
    onMyChannelClick(channel, index) {
      // 如果是编辑状态，则执行删除频道
      if (this.isEdit) {
        // 1.固定频道不允许删除
        if (this.fixedChannels.includes(channel.id)) {
          return;
        }

        // 2.删除频道项
        this.myChannels.splice(index, 1);

        // 3.若删除的是激活之前的频道项，那么更新激活的频道项
        // 参数1：要删除的元素的开始索引（包括）
        // 参数2；删除的个数，如果不指定，那就从参数1开始一直删除到最后
        if (index <= this.active) {
          // 让激活频道的索引 - 1
          this.$emit("update-active", this.active - 1, true);
        }

        // 4.持久化删除
        this.deleteChannel(channel);
      } else {
        // 若非编辑状态，执行切换回该频道
        this.$emit("update-active", index, false);
      }
    },
    async deleteChannel(channel) {
      try {
        if (this.user) {
          // 已登录，将数据更新到线上
          await deleteUserChannels(channel.id);
        } else {
          // 未登录，将数据更新到本地存储
          setItem("TOUTIAO_CHANNELS", this.myChannels);
        }
      } catch (err) {
        this.$toast("操作失败，请稍后重试");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.channel-edit {
  padding: 85px 0;

  .title-text {
    font-size: 32px;
    color: #333;
  }

  .edit-btn {
    width: 104px;
    height: 48px;
    font-size: 26px;
    color: #f85959;
    border: 1px solid #f85959;
  }

  /deep/.grid-item {
    width: 160px;
    height: 86px;
    .van-grid-item__content {
      white-space: nowrap;
      background-color: #f4f5f6;
      .van-grid-item__text,
      .text {
        font-size: 28px;
        color: #222;
        margin-top: 0;
      }
      .active {
        color: red;
      }
      .van-grid-item__icon-wrapper {
        position: unset;
      }
    }
  }

  /deep/ .my-grid {
    .grid-item {
      .van-icon-clear {
        position: absolute;
        right: -10px;
        top: -10px;
        font-size: 30px;
        color: #cacaca;
        z-index: 2;
      }
    }
  }

  /deep/.recommend-grid {
    .grid-item {
      .van-grid-item__content {
        flex-direction: row;
        .van-icon-plus {
          font-size: 28px;
          margin-right: 6px;
        }
      }
    }
  }
}
</style>