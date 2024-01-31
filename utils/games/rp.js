async function createRP(rp, emoji, ctx, replyToMessage, comment) {
  const firstName = ctx.message.from.first_name.replaceAll(
    /[\\`*_{}\[\]()#+\-.!()]/g,
    "\\$&"
  );
  const replyFirstName = replyToMessage.from.first_name.replaceAll(
    /[\\`*_{}\[\]()#+\-.!()]/g,
    "\\$&"
  );

  try {
    let replyMessage =
      `${emoji} [${firstName}](tg://user?id=${ctx.message.from.id}) ` +
      `${rp.replaceAll(/[\\*_{}\[\]()#+\-.!()]/g, "\\$&")} ` +
      `[${replyFirstName}](tg://user?id=${replyToMessage.from.id})`;

    if (comment) {
      replyMessage += `\n\n💬 С комментарием: ${comment}`;
    }

    ctx.telegram.sendMessage(replyToMessage.chat.id, replyMessage, {
      reply_to_message_id: replyToMessage.message_id,
      parse_mode: "MarkdownV2",
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createRP };
