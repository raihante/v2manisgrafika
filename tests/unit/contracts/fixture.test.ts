// Fixture adapters against the repository contract. The MySQL adapters get a sibling file with the same call.
import { repositories } from "@/lib/data";
import { describeRepositoryContract } from "./repository-contract";

describeRepositoryContract("fixtures", repositories);
