"""add experiment ownership foreign keys

Revision ID: 0017_analytics_integrity
Revises: 0016_analytics_experiments
"""

from alembic import op

revision = "0017_analytics_integrity"
down_revision = "0016_analytics_experiments"
branch_labels = None
depends_on = None


def upgrade():
    # 0016 predated these foreign keys. Discard impossible orphan rows rather
    # than allowing test/development residue to make the integrity upgrade fail.
    op.execute(
        "DELETE FROM experiment_assignments a WHERE NOT EXISTS "
        "(SELECT 1 FROM experiments e WHERE e.key = a.experiment_key "
        "AND e.version = a.experiment_version)"
    )
    op.execute(
        "DELETE FROM experiment_variants v WHERE NOT EXISTS "
        "(SELECT 1 FROM experiments e WHERE e.key = v.experiment_key "
        "AND e.version = v.experiment_version)"
    )
    op.create_foreign_key(
        "fk_experiment_variants_experiment",
        "experiment_variants",
        "experiments",
        ["experiment_key", "experiment_version"],
        ["key", "version"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_experiment_assignments_experiment",
        "experiment_assignments",
        "experiments",
        ["experiment_key", "experiment_version"],
        ["key", "version"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint("fk_experiment_assignments_experiment", "experiment_assignments")
    op.drop_constraint("fk_experiment_variants_experiment", "experiment_variants")
