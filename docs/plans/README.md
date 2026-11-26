# Design Plans

Plans record the design and execution steps for one non-trivial deliverable. Bugfixes and routine changes do not need a plan—explain what changed, why, and how it was verified directly in the PR description. See [`CONTRIBUTING.md`](../../CONTRIBUTING.md#change-design-gate).

Start from [`0000-template.md`](0000-template.md). Number new plans sequentially (`0001-…`) and keep only the sections that apply. Plans are written in Chinese (the shipped template is English; write in Chinese following its structure).

Once the code lands on `master`, retire the plan in the final delivery PR: move remaining follow-ups to issues, migrate lasting non-code constraints into `docs/architecture.md` (or local `Why:` comments), and delete the plan file. Historical migration notes referenced by `docs/architecture.md` remain until superseded.
