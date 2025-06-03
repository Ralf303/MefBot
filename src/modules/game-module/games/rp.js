async function createRP(rp, emoji, ctx, replyToMessage, comment) {
  try {
    const firstName = ctx.message.from.first_name;
    const replyFirstName = replyToMessage.from.first_name;

    let replyMessage =
      `${emoji} <a href="tg://user?id=${ctx.message.from.id}">${firstName}</a> ` +
      `${rp} ` +
      `<a href="tg://user?id=${replyToMessage.from.id}">${replyFirstName}</a>`;

    if (comment) {
      replyMessage += `\n\n💬 С комментарием: ${comment}`;
    }

    ctx.telegram.sendMessage(replyToMessage.chat.id, replyMessage, {
      reply_to_message_id: replyToMessage.message_id,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.log(error);
  }
}

export { createRP };
