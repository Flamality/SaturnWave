import chalk from "chalk";

export default (client) => {
  console.log(
    chalk.yellow.italic(`Logged in as ${chalk.blue.bold(client.user.tag)}!`)
  );
};
